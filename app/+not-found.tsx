import { Button } from "@/components/Button";
import { Text } from "@/components/Themed";
import { SafeView } from "@/components/View";
import { useStore } from "@/store/store";
import { router } from "expo-router";
import { t } from "i18next";
import { View } from "react-native";

export default function NotFoundScreen() {
  const user = useStore((s) => s.user);
  return (
    <>
      <SafeView safeZone="bottom" className="bg-light  dark:bg-dark-bg flex-1 justify-center items-center p-4">
        <View className="gap-y-4">
          <Text className="text-center text-[35px] font-jakarta-bold text-dark dark:text-gray-100">{t("Oups!")}</Text>
          <Text className="text-center text-[16px] font-jakarta-medium text-dark dark:text-gray-200">{t("Page inexistante. Veuillez retourner à l'acceuil.")}</Text>
          <View className="mt-6">
            <Button.Primary fullwidth={false} onPress={()=>{
              router.dismissTo(user?.role=="CLIENT" ? "/client/dashboard":"/merchant/dashboard")
            }}>
              <View>
                <View className="flex-row items-center gap-x-4">
                  <Text className="text-center font-jakarta-medium text-[14px] text-white dark:text-white">{t("Retourner à l'acceuil")}</Text>
                </View>
              </View>
            </Button.Primary>
          </View>
        </View>
      </SafeView>
    </>
  );
}
