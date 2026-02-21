import { Image } from "expo-image";

export function Logo() {
    return (
        <Image style={{height:35, width:45}} source={require("../assets/images/favicon.png")}/>

    )
}