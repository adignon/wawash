import { clx } from "@/helpler";
import { Text as RNText, TextProps } from "react-native";

export function Text({className, ...props}: TextProps) {
  return (
    <RNText
        className={clx("text-dark dark:text-gray-200 font-jakarta", className)}
      {...props}
    />
  );
}