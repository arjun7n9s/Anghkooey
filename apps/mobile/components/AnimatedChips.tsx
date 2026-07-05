import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { ItemChip } from "./ItemChip";

type Item = { id: string; name: string; category?: string };

export function AnimatedChips({
  items,
  onRemove,
}: {
  items: Item[];
  onRemove?: (id: string) => void;
}) {
  const anims = useRef<Animated.Value[]>([]);

  useEffect(() => {
    while (anims.current.length < items.length) {
      anims.current.push(new Animated.Value(0));
    }
    items.forEach((_, i) => {
      anims.current[i].setValue(0);
      Animated.timing(anims.current[i], {
        toValue: 1,
        duration: 280,
        delay: i * 45,
        useNativeDriver: true,
      }).start();
    });
  }, [items.map((i) => i.id).join(",")]);

  return (
    <View style={styles.row}>
      {items.map((item, i) => (
        <Animated.View
          key={item.id}
          style={{
            opacity: anims.current[i] ?? 1,
            transform: [
              {
                translateY: (anims.current[i] ?? new Animated.Value(1)).interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ItemChip
            name={item.name}
            category={item.category}
            onRemove={onRemove ? () => onRemove(item.id) : undefined}
          />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
