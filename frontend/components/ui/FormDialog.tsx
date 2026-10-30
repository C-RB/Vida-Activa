import React from "react";
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Type } from "../../constants/theme";
import Button from "./Button";

type Props = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children: React.ReactNode;
};

export default function FormDialog({
  visible,
  title,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
  children,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={[Type.title2, styles.title]}>{title}</Text>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              variant="text"
              compact
              onPress={onCancel}
              style={styles.action}
            />
            <Button
              title={confirmLabel}
              compact
              loading={loading}
              onPress={onConfirm}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.overlay,
  },
  dialog: {
    maxHeight: "90%",
    gap: 16,
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
  },
  title: {
    color: Colors.textPrimary,
  },
  body: {
    gap: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  action: {
    flex: 1,
  },
});
