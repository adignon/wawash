module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}", "./toast.config.tsx"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                "jakarta-bold": "JakartaBold",
                "jakarta-extrabold": "JakartaExtraBold",
                "jakarta-light": "JakartaLight",
                "jakarta-medium": "JakartaMedium",
                "jakarta-semibold": "JakartaSemiBold",
                "jakarta": "Jakarta"
            },
            colors: {
                light: {
                    DEFAULT: "#F6F8F7",
                },
                gray:{
                    100:"#EEEEEE",
                    DEFAULT:"#ccc"
                },
                dark: {
                    300: "#828282",
                    400: "#4F4F4F",
                    text: "#333333",
                    "DEFAULT":"#333333",
                    bg:"#0D1117",
                    border:"#6f757eff",
                    lighter:"#30363D"
                },
                primary: {

                    dark: "#035E6E",
                    200:"#00BBDC",
                    300:"#1A8EA1",
                    DEFAULT: "#06ADC9",
                    500:"#04788C"
                },
                red: {
                    DEFAULT: "#FF6467"
                },
                green:{
                    DEFAULT:'#27C840'
                }
            }
        },
    },
    plugins: [],
}