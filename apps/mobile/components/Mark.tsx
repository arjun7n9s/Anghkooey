import Svg, { Circle, Path } from "react-native-svg";
import { theme } from "../lib/theme";

export function Mark({
  size = 22,
  weight = "normal",
}: {
  size?: number;
  weight?: "normal" | "bold";
}) {
  const stroke = weight === "bold" ? 2.25 : 1.75;
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="10" fill={theme.stamp} />
      <Circle cx="11" cy="11" r="9.25" stroke={theme.night} strokeWidth={stroke} />
      <Path
        d="M8.2 15.2V6.8h2.1c1.45 0 2.45.28 3 .85.55.56.82 1.35.82 2.35 0 1.02-.28 1.82-.85 2.38-.57.56-1.48.82-2.72.82H8.2zm1.55-1.35h.55c.82 0 1.4-.16 1.75-.48.35-.32.52-.86.52-1.62 0-.74-.17-1.26-.52-1.56-.35-.3-.92-.45-1.72-.45h-.58v4.11z"
        fill={theme.night}
      />
    </Svg>
  );
}
