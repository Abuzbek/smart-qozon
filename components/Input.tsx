import { Colors } from "@/constants/Colors";
import React, { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export const Input = ({
  label,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  error,
  style,
  ...props
}: InputProps) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[styles.container, error ? styles.errorBorder : null, style]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            inputStyle,
            !leftIcon ? { paddingHorizontal: 12 } : { paddingHorizontal: 6 },
          ]}
          placeholderTextColor="#999"
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
    marginLeft: 4,
    fontFamily: "Fredoka_Medium",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.text,
    borderRadius: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
    fontFamily: "Fredoka_Regular",
    height: "100%", // ensure it fills height for multiline or centering
  },
  iconLeft: {
    marginRight: 4,
    marginLeft: 10,
  },
  iconRight: {
    marginLeft: 4,
    marginRight: 10,
  },
  errorBorder: {
    borderColor: Colors.light.secondary,
  },
  errorText: {
    color: Colors.light.secondary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
