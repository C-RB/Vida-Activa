import React, { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SvgXml } from "react-native-svg";
import { ICONS, IconName } from "../../constants/icons";
import { Colors } from "../../constants/theme";

export type MdiName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type Props = {
  size?: number;
  // Replaces the stroke/fill color of single-color icons.
  color?: string;
} & ({ name: IconName; mdi?: never } | { mdi: MdiName; name?: never });

// `name` renders an icon of the v2 set; `mdi` is a temporary fallback for icons
// the Figma set does not include yet.
export default function Icon({ name, mdi, size = 24, color }: Props) {
  if (mdi) {
    return (
      <MaterialCommunityIcons name={mdi} size={size} color={color ?? Colors.textSecondary} />
    );
  }
  const xml = color
    ? ICONS[name].replace(/(stroke|fill)="#[0-9A-Fa-f]{3,6}"/g, `$1="${color}"`)
    : ICONS[name];
  return <SvgXml xml={xml} width={size} height={size} />;
}
