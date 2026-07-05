import { theme } from "./theme";

export const fonts = {
  display: "Fraunces_700Bold",
  displaySemi: "Fraunces_600SemiBold",
  displayItalic: "Fraunces_400Regular_Italic",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
  label: "DMSans_600SemiBold",
};

export const type = {
  display: { fontFamily: fonts.display, fontSize: 34, color: theme.ink, letterSpacing: -1 },
  title: { fontFamily: fonts.displaySemi, fontSize: 28, color: theme.ink },
  body: { fontFamily: fonts.body, fontSize: 16, color: theme.inkSoft, lineHeight: 24 },
  label: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: theme.faded,
    letterSpacing: 1.2,
    textTransform: "uppercase" as const,
  },
  button: { fontFamily: fonts.bodyBold, fontSize: 16 },
};
