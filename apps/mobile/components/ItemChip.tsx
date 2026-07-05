import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryColor, theme } from "../lib/theme";
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
        <Pressable onPress={onRemove} hitSlop={8}>
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
    gap: 6,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 999,
  },
  text: { fontFamily: fonts.bodyMedium, color: theme.paper, fontSize: 13 },
  remove: { color: theme.paper, fontSize: 18, lineHeight: 18, opacity: 0.85 },
});
