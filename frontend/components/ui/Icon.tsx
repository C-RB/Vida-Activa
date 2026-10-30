import React from "react";
import { SvgXml } from "react-native-svg";
import { ICONS, IconName } from "../../constants/icons";

type Props = {
  name: IconName;
  size?: number;
  // Reemplaza el color del trazo/relleno (solo para íconos de un solo color).
  color?: string;
};

export default function Icon({ name, size = 24, color }: Props) {
  const xml = color
    ? ICONS[name].replace(/(stroke|fill)="#[0-9A-Fa-f]{3,6}"/g, `$1="${color}"`)
    : ICONS[name];
  return <SvgXml xml={xml} width={size} height={size} />;
}
