import { theme } from "@/tailwind.config";
import { t } from "i18next";

export const PACKAGES = {

    "LESSIVE_CELIBATAIRE": {
        name:t("Abonnement célibartaire"),
        image: require("@/assets/images/package-1.png"),
        button: {
            className: "bg-primary/20 dark:bg-primary-400/20",
            color: theme.extend.colors.primary.DEFAULT
        },
        widthImage: 181,
        heightImage: 0,
        reverse: false
    },
    "LESSIVE_COUPLE": {
        name:t("Abonnement couple"),
        image: require("@/assets/images/package-2.png"),
        button: {
            className: "bg-[#2E4D02] dark:bg-[#1A2C01]",
            color: "#83BD31"
        },
        widthImage: 290 + 50,
        heightImage: 240 + 50,
        reverse: false,
        imagePosition: "-15%",
        locations: [0, 0.38, 0.38, 0.38, 0.60, 1]
    },
    "LESSIVE_FAMILLE": {
        name:t("Abonnement famille"),
        image: require("@/assets/images/package-3.png"),
        button: {
            className: "bg-[#C56520]/50",
            color: "#fff"
        },
        widthImage: 320,
        heightImage: 290,
        reverse: true, imagePosition: "-20%"
    },
    "LESSIVE_UNIQUE": {
        name:t("Commande lessive unique"),
        image: require("@/assets/images/service-1.png"),
        button: {
            className: "bg-[#C56520]/50",
            color: "#fff"
        },
        widthImage: 251,
        heightImage: 282,
        reverse: false, 
        imagePosition: "0%"
    }
}