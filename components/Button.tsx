import { Colors } from "@/constants/Colors";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

type ButtonVariant = "primary" | "outline" | "text" | "icon";

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  variant?: ButtonVariant;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = ({
  title,
  variant = "primary",
  leftIcon,
  rightIcon,
  loading,
  disabled,
  style,
  textStyle,
  children,
  ...props
}: ButtonProps) => {
  const isWeb = typeof window !== "undefined"; // Simple check or pass from platform if needed

  const getBackgroundColor = () => {
    if (disabled) return "#E0E0E0";
    if (variant === "primary") return Colors.light.primary;
    return "transparent";
  };

  const getBorderColor = () => {
    if (disabled) return "transparent";
    if (variant === "outline") return Colors.light.primary;
    return "transparent";
  };

  const getTextColor = () => {
    if (disabled) return "#999";
    if (variant === "primary") return "#fff";
    if (variant === "outline") return Colors.light.primary;
    if (variant === "text") return Colors.light.text;
    return Colors.light.primary;
  };

  const containerStyles = [
    styles.base,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === "outline" ? 1 : 0,
    },
    variant === "icon" && styles.iconButton,
    variant === "text" && styles.textButton,
    style,
  ];

  const _textStyle = [styles.text, { color: getTextColor() }, textStyle];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          {title ? <Text style={_textStyle}>{title}</Text> : null}
          {children}
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 52,
  },
  textButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 0,
  },
  iconButton: {
    padding: 12,
    minHeight: 0,
    minWidth: 0,
    borderRadius: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
