import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { ToastShowParams } from "react-native-toast-message";
import theme from "./tailwind.config";

export const toastConfig = {

  success: ({ text1, props, text2, position="bottom" }: ToastShowParams) => (
    <View style={{ maxHeight: 100, width: '90%', display: "flex", flexDirection: "row", alignItems: "center", borderRadius: 15, padding: 10, paddingHorizontal: 10, backgroundColor: (theme.theme?.extend?.colors as any)?.green["DEFAULT"]+"c2"}}>
      <View className=" " style={{ width: 30, height: 30 }}>
        <LottieView autoPlay loop={false} style={{ flex: 1 }} source={require("@/assets/lotties/success.json")} />
      </View>
      <View style={{ marginLeft: 10, paddingLeft:10 }}>
        {
          text1 ? (
            <View>
              <Text className="font-jakarta-semibold text-[15px] text-white">{text1}</Text>
            </View>
          ):<></>
        }

        {
          text2 ? (
            <View className="mt-2">
              <Text className="font-jakarta text-[14px] text-white  ">{text2}</Text>
            </View>
          ) : <></>
        }
      </View>
    </View>
  ),
  error: ({ text1, props, text2, position="bottom" }: ToastShowParams) => (
    <View  style={{ maxHeight: 100, width: '90%', display: "flex", flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 10, paddingHorizontal: 10, backgroundColor:"#742e2f" }}>
      <View className=" " style={{ width: 30, height: 30 }}>
        <LottieView autoPlay loop={false} style={{ flex: 1 }} source={require("@/assets/lotties/error.json")} />
      </View>
      <View style={{ marginLeft: 5 , paddingLeft:10}}>
        {
          text1 ? (
            <View>
              <Text className="font-jakarta-semibold text-[15px] text-white dark:text-white">{text1}</Text>
            </View>
          ):<></>
        }

        {
          text2 ? (
            <View className="mt-1 ">
              <Text className="font-jakarta text-[14px] text-white dark:text-white">{text2}</Text>
            </View>
          ) : <></>
        }
      </View>
    </View>
  )
};
