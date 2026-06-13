import { IconType } from "react-icons";
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiMui,
  SiNodedotjs,
  SiMongodb,
  SiFlutter,
  SiDart,
  SiSocketdotio,
  SiRedux,
  SiFirebase,
  SiGooglemaps,
  SiOpenai,
  SiTensorflow,
} from "react-icons/si";
import { FaCode } from "react-icons/fa";

export const techIconMap: Record<string, IconType> = {
  react: SiReact,
  javascript: SiJavascript,
  typescript: SiTypescript,
  material: SiMui,
  nodejs: SiNodedotjs,
  mongodb: SiMongodb,
  flutter: SiFlutter,
  dart: SiDart,
  socketio: SiSocketdotio,
  redux: SiRedux,
  firebase: SiFirebase,
  google: SiGooglemaps,
  openai: SiOpenai,
  tensorflow: SiTensorflow,
  architecture: FaCode,
  riverpod: FaCode,
  dio: FaCode,
  getit: FaCode,
  getx: FaCode,
  geolocator: SiGooglemaps,
  googlemaps: SiGooglemaps,
};

export function getTechIcon(iconName: string): IconType {
  return techIconMap[iconName.toLowerCase()] || FaCode;
}
