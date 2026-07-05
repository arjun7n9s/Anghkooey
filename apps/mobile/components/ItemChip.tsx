import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryColor, radius, space, theme } from "../lib/theme";
import { fonts } from "../lib/typography";

export function ItemChip({
  name,
  category,
  onRemove,
}: {
  name: string;
  category?: string;
  onRemove?: () => void;
}) {
  const bg = categoryColor(category);
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={styles.text}>{name}</Text>
      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={space.sm}>
          <Text style={styles.remove}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingLeft: space.md,
    paddingRight: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
  },
  text: { fontFamily: fonts.bodyMedium, color: theme.paper, fontSize: 13 },
  remove: { color: theme.paper, fontSize: 18, lineHeight: 18, opacity: 0.85 },
});
