import { Mark } from "./Mark";

/**
 * Brand mark. Uses the react-native-svg Mark on all platforms (incl. web) so it
 * renders crisply. The animated SVG asset in /assets is reserved for the live
 * demo projection, not the in-app nav.
 */
export function AngkMark({
  size = 22,
  weight = "normal",
}: {
  size?: number;
  weight?: "normal" | "bold";
}) {
  return <Mark size={size} weight={weight} />;
}
