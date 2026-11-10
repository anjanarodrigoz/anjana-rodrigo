"""
Builds the guide character in Blender and exports public/models/character.glb.

Run:  python tools/blender/character.py      (needs `pip install bpy`)

The model is split into named parts so the site can pose and dress it:
  Character > Body, Head (Eyes, HairTop, Helmet, Glasses), ArmL (Tablet,
  CoatSleeveL), ArmR (CoatSleeveR), Coat
Coordinates below are written as (x, up, front) and converted to Blender's
Z-up space; the glTF exporter turns that back into Y-up, facing +Z.
"""
import math
import os

import bpy  # isort: skip  (must load before bmesh)
import bmesh

bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.context.scene.collection


def P(x, y, z):  # (x, up, front) -> Blender
    return (x, -z, y)


def S(sx, sy, sz):
    return (sx, sz, sy)


def lin(c):
    c /= 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def mat(name, hex_, rough=0.6, metal=0.0, emit=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    rgb = (lin((hex_ >> 16) & 255), lin((hex_ >> 8) & 255), lin(hex_ & 255), 1)
    b.inputs["Base Color"].default_value = rgb
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = rgb
        b.inputs["Emission Strength"].default_value = emit
    return m


M = dict(
    skin=mat("Skin", 0xE0AC7E, 0.6),
    blush=mat("Blush", 0xE49A84, 0.7),
    hoodie=mat("Hoodie", 0x1D4A3E, 0.85),
    hoodie_dark=mat("HoodieDark", 0x163A31, 0.9),
    trousers=mat("Trousers", 0x3A4046, 0.9),
    shoe=mat("Shoe", 0xF2F2EE, 0.5),
    sole=mat("Sole", 0x8DAA91, 0.6),
    hair=mat("Hair", 0x14100E, 0.8),
    white=mat("White", 0xFFFFFF, 0.3),
    iris=mat("Iris", 0x4A2C18, 0.25),
    black=mat("Black", 0x0A0807, 0.25),
    mouth=mat("Mouth", 0x8A3B32, 0.5),
    helmet=mat("HelmetYellow", 0xF2C200, 0.3),
    band=mat("HelmetBand", 0x2C3632, 0.6),
    tablet=mat("Tablet", 0x1B1F1D, 0.3, 0.4),
    screen=mat("Screen", 0xDFEEE2, 0.2, 0, 1.2),
    coat=mat("Coat", 0xFAFBFC, 0.75),
)


def finish(o, material, parent, smooth=True):
    o.data.materials.append(material)
    if smooth:
        for p in o.data.polygons:
            p.use_smooth = True
    o.parent = parent
    return o


def sphere(parent, material, loc, r, scale=(1, 1, 1), seg=40):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=seg // 2, location=P(*loc))
    o = bpy.context.object
    o.scale = S(*scale)
    return finish(o, material, parent)


def capsule(parent, material, loc, r, length, rot=(0, 0, 0), scale=(1, 1, 1)):
    """A capsule standing up, built from one mesh so it stays seamless."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=16, radius=r)
    for v in bm.verts:  # stretch the two hemispheres apart
        v.co.z += length / 2 if v.co.z > 1e-6 else (-length / 2 if v.co.z < -1e-6 else 0)
    me = bpy.data.meshes.new("capsule")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("capsule", me)
    col.objects.link(o)
    o.location = P(*loc)
    o.rotation_euler = rot
    o.scale = S(*scale)
    return finish(o, material, parent)


def box(parent, material, loc, size, bevel=0.01, rot=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    sx, sy, sz = S(*size)
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=3, affect="EDGES")
    me = bpy.data.meshes.new("box")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("box", me)
    col.objects.link(o)
    o.location = P(*loc)
    o.rotation_euler = rot
    return finish(o, material, parent)


def cyl(parent, material, loc, r1, r2, h, scale=(1, 1, 1), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=r1, radius2=r2, depth=h, location=P(*loc))
    o = bpy.context.object
    o.scale = S(*scale)
    o.rotation_euler = rot
    return finish(o, material, parent)


def dome(parent, material, loc, r, scale=(1, 1, 1)):
    """Upper half of a sphere (helmet shell)."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=r)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -1e-6], context="VERTS")
    me = bpy.data.meshes.new("dome")
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new("dome", me)
    col.objects.link(o)
    o.location = P(*loc)
    o.scale = S(*scale)
    m = o.modifiers.new("solid", "SOLIDIFY")
    m.thickness = 0.02
    return finish(o, material, parent)


def torus(parent, material, loc, R, r, rot=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=40, minor_segments=10, location=P(*loc), rotation=rot)
    return finish(bpy.context.object, material, parent)


def arc(parent, material, loc, radius, thick, a0, a1):
    """A tube along a circular arc in the face plane (smile, brows)."""
    cu = bpy.data.curves.new("arc", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = thick
    cu.bevel_resolution = 4
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    n = 16
    sp.points.add(n)
    for i in range(n + 1):
        a = a0 + (a1 - a0) * i / n
        sp.points[i].co = (math.cos(a) * radius, 0, math.sin(a) * radius, 1)
    o = bpy.data.objects.new("arc", cu)
    col.objects.link(o)
    o.location = P(*loc)
    o.data.materials.append(material)
    o.parent = parent
    return o


def blob(parent, material, points, resolution=0.035):
    """Metaballs fused into one soft mass (used for the curly hair)."""
    mb = bpy.data.metaballs.new("blob")
    mb.resolution = resolution
    mb.threshold = 0.6
    for (x, y, z), r in points:
        e = mb.elements.new()
        e.co = P(x, y, z)
        e.radius = r
    o = bpy.data.objects.new("blob", mb)
    col.objects.link(o)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    bpy.data.objects.remove(o)
    out = bpy.data.objects.new("blobmesh", me)
    col.objects.link(out)
    return finish(out, material, parent)


def pivot(name, parent, loc):
    e = bpy.data.objects.new(name, None)
    col.objects.link(e)
    e.location = P(*loc)
    e.parent = parent
    return e


def join(name, parent):
    """Merge all mesh/curve children of a pivot into one object."""
    kids = [c for c in parent.children if c.type in {"MESH", "CURVE"}]
    if not kids:
        return
    bpy.ops.object.select_all(action="DESELECT")
    for k in kids:
        k.select_set(True)
    bpy.context.view_layer.objects.active = kids[0]
    bpy.ops.object.convert(target="MESH")  # applies modifiers and curves
    bpy.ops.object.join()
    bpy.context.object.name = name


root = pivot("Character", None, (0, 0, 0))

# ---- Body: legs, sneakers, hoodie ----------------------------------------
body = pivot("Body", root, (0, 0, 0))
for side in (-1, 1):
    capsule(body, M["trousers"], (side * 0.13, 0.36, 0), 0.098, 0.36)
    capsule(body, M["shoe"], (side * 0.13, 0.075, 0.06), 0.086, 0.17, rot=(math.pi / 2, 0, 0), scale=(1, 0.85, 1))
    box(body, M["sole"], (side * 0.13, 0.018, 0.06), (0.175, 0.036, 0.36), bevel=0.014)
    box(body, M["hoodie"], (side * 0.13, 0.13, 0.13), (0.1, 0.03, 0.1), bevel=0.012)  # tongue
capsule(body, M["hoodie"], (0, 0.84, 0), 0.245, 0.26, scale=(1, 1, 0.82))
cyl(body, M["hoodie_dark"], (0, 0.6, 0), 0.215, 0.225, 0.07, scale=(1, 1, 0.84))  # ribbed hem
sphere(body, M["hoodie_dark"], (0, 0.72, 0.185), 0.16, (1, 0.6, 0.32))  # pocket
sphere(body, M["hoodie_dark"], (0, 1.1, -0.14), 0.22, (1.05, 0.7, 0.8))  # hood
torus(body, M["hoodie_dark"], (0, 1.12, 0.0), 0.14, 0.04, rot=(0.35, 0, 0))  # collar
for side in (-1, 1):
    capsule(body, M["white"], (side * 0.06, 0.97, 0.205), 0.009, 0.13)
    sphere(body, M["white"], (side * 0.06, 0.895, 0.207), 0.016, seg=12)
sphere(body, M["skin"], (0, 1.17, 0), 0.085, (1, 1, 1), seg=20)  # neck
join("BodyMesh", body)

# ---- Lab coat (hidden unless in the research lab) -------------------------
coat = pivot("Coat", root, (0, 0, 0))
for side in (-1, 1):
    capsule(coat, M["coat"], (side * 0.095, 0.82, -0.005), 0.25, 0.32, scale=(0.72, 1, 0.92))
capsule(coat, M["coat"], (0, 0.83, -0.07), 0.25, 0.32, scale=(1.02, 1, 0.7))
for side in (-1, 1):
    cyl(coat, M["coat"], (side * 0.14, 0.42, 0.01), 0.25, 0.2, 0.42, scale=(0.66, 1, 0.9))
    box(coat, M["coat"], (side * 0.09, 1.0, 0.2), (0.08, 0.24, 0.025), bevel=0.008, rot=(0, side * 0.42, 0))
box(coat, M["coat"], (0.17, 0.7, 0.225), (0.11, 0.12, 0.015), bevel=0.005)
capsule(coat, M["hoodie"], (0.185, 0.77, 0.235), 0.007, 0.08)  # pen
join("CoatMesh", coat)

# ---- Arms ------------------------------------------------------------------
arms = {}
for name, side in (("ArmL", -1), ("ArmR", 1)):
    a = pivot(name, root, (side * 0.3, 1.02, 0))
    arms[name] = a
    capsule(a, M["hoodie"], (0, -0.2, 0), 0.078, 0.3)
    cyl(a, M["hoodie_dark"], (0, -0.37, 0), 0.074, 0.07, 0.05)
    sphere(a, M["skin"], (0, -0.43, 0), 0.078, (0.95, 1, 0.9), seg=24)
    sphere(a, M["skin"], (side * -0.055, -0.42, 0.03), 0.03, seg=12)  # thumb
    join(name + "Mesh", a)
    sl = pivot("CoatSleeve" + name[-1], a, (0, 0, 0))
    capsule(sl, M["coat"], (0, -0.18, 0), 0.094, 0.28)
    join("CoatSleeve" + name[-1] + "Mesh", sl)
tab = pivot("Tablet", arms["ArmL"], (0.07, -0.46, 0.11))
tab.rotation_euler = (0.55, 0, 0.2)
box(tab, M["tablet"], (0, 0, 0), (0.3, 0.4, 0.022), bevel=0.01)
box(tab, M["screen"], (0, 0, 0.012), (0.26, 0.36, 0.004), bevel=0)
join("TabletMesh", tab)

# ---- Head --------------------------------------------------------------------
head = pivot("Head", root, (0, 1.55, 0))
sphere(head, M["skin"], (0, 0, 0), 0.42, (1, 0.96, 0.95), seg=56)
for side in (-1, 1):
    sphere(head, M["skin"], (side * 0.41, -0.03, 0), 0.09, (0.5, 1, 0.8), seg=20)
    sphere(head, M["blush"], (side * 0.25, -0.13, 0.305), 0.06, (1, 0.7, 0.3), seg=16)
    arc(head, M["hair"], (side * 0.16, 0.07, 0.385), 0.1, 0.014, math.pi * 0.36, math.pi * 0.64)  # brow
sphere(head, M["skin"], (0, -0.09, 0.41), 0.042, (1, 0.9, 1), seg=16)  # nose
arc(head, M["mouth"], (0, -0.14, 0.375), 0.085, 0.016, math.pi * 1.22, math.pi * 1.78)  # smile
# Base hair: a low soft cap that stays on under the helmet.
blob(head, M["hair"], [((math.cos(a) * 0.3 * math.cos(e), 0.06 + math.sin(e) * 0.28, -0.08 + math.sin(a) * 0.3 * math.cos(e)), 0.3) for e in (0.2, 0.7) for a in [i * math.pi / 5 for i in range(10)] if math.sin(a) < 0.55])
join("HeadMesh", head)

eyes = pivot("Eyes", head, (0, 0, 0))
for side in (-1, 1):
    ex = side * 0.155
    sphere(eyes, M["white"], (ex, 0, 0.345), 0.095, (1, 1.15, 0.5), seg=28)
    sphere(eyes, M["iris"], (ex, -0.005, 0.38), 0.058, (1, 1.1, 0.4), seg=24)
    sphere(eyes, M["black"], (ex, -0.005, 0.395), 0.032, (1, 1.1, 0.4), seg=16)
    sphere(eyes, M["white"], (ex + 0.02, 0.025, 0.407), 0.013, seg=10)
join("EyesMesh", eyes)

# Curly hair: many small balls fused into one fluffy mass.
top = pivot("HairTop", head, (0, 0, 0))
pts = []
for i in range(420):
    y = 1 - (i / 419) * 1.2
    r = math.sqrt(max(0, 1 - y * y))
    phi = i * 2.399963
    x, z = math.cos(phi) * r, math.sin(phi) * r
    if (z > 0.38 and y < 0.45) or y < -0.2:
        continue
    lift = 1.1 + 0.08 * math.sin(i * 1.7)
    pts.append(((x * 0.45 * lift, 0.03 + y * 0.44 * lift, z * 0.44 * lift - 0.02), 0.135 + (i * 37 % 7) * 0.009))
# Small, barely-touching balls keep each curl visible as its own bump.
blob(top, M["hair"], pts, resolution=0.018)
join("HairTopMesh", top)

helmet = pivot("Helmet", head, (0, 0.13, 0))
dome(helmet, M["helmet"], (0, 0, 0), 0.5, (1, 0.74, 1.03))
cyl(helmet, M["helmet"], (0, 0.0, 0.1), 0.56, 0.54, 0.035, scale=(1, 1, 1.16))  # brim
dome(helmet, M["helmet"], (0, 0.19, 0), 0.5, (0.12, 0.42, 0.9))  # ridge
cyl(helmet, M["band"], (0, 0.04, 0), 0.503, 0.503, 0.03, scale=(1, 1, 1.03))
join("HelmetMesh", helmet)

glasses = pivot("Glasses", head, (0, 0, 0.4))
for side in (-1, 1):
    torus(glasses, M["black"], (side * 0.155, 0, 0), 0.105, 0.012)
    box(glasses, M["black"], (side * 0.32, 0, -0.2), (0.012, 0.012, 0.42), bevel=0.003, rot=(0, 0, side * -0.25))
box(glasses, M["black"], (0, 0.01, 0), (0.1, 0.014, 0.014), bevel=0.004)
join("GlassesMesh", glasses)

out = os.path.join(os.path.dirname(__file__), "..", "..", "public", "models", "character.glb")
bpy.ops.export_scene.gltf(filepath=os.path.abspath(out), export_format="GLB", export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False)
print("wrote", os.path.abspath(out), os.path.getsize(out) // 1024, "KB")
