import { t } from "i18next";
import { View } from "react-native";
import { Button } from "./Button";
import { Text } from "./Themed";

export function ErrorRetry({retry}:{retry:Function}){
    return(
        <View className="gap-y-4 px-4 flex-1 justify-center items-center">
            <Text className="text-[50px] text-center font-jakarta-semibold text-dark">{t("Oups !")}</Text>
            <Text className="text-[14px] text-center text-dark jakarka">{t("Une erreur inatendue est survenue, toutes nos excuses, veuillez reprendre !")}</Text>
            <Button.Primary label={t("Rééssayer")} onPress={()=>retry()}/>
        </View>
    )
}