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
                gray: {
                    100: "#EEEEEE",
                    200:"#DCDCDC",
                    400:"#C7C7C7",
                    DEFAULT: "#ccc"
                },
                dark: {
                    300: "#828282",
                    350:"#7E7C7C",
                    400: "#4F4F4F",
                    
                    text: "#333333",
                    "DEFAULT": "#333333",
                    bg: "#0D1117",
                    "dark-bg":"#222",
                    border: "#6f757eff",
                    lighter: "#30363D"
                },
                primary: {
                    "dark-dark":"#023A43",
                    dark: "#035E6E",
                    100: "#C5F7FF",
                    "dark-100":"#0E2F36",
                    150: "#59E0F7",
                    "dark-150":"#3AB0C2",
                    200: "#00BBDC",
                    "dark-200":"#008BA3",
                    300: "#1A8EA1",
                    "dark-300":"#136C7C",
                    "base-dark":"#048FA3",
                    400:"#5DC6D8",
                    DEFAULT: "#06ADC9",
                    500: "#04788C",
                    "dark-500":"#035C66"
                },
                red: {
                    DEFAULT: "#FF6467",
                    500: "#EB5757"
                },
                green: {
                    DEFAULT: '#27C840'
                },
                yellow: {
                    300: "#FFF6CB",
                    "dark-300":"#3B3418",
                    400: "#FFE460",
                    DEFAULT: "#FFCB33",
                }
            }
        },
    },
    plugins: [],
}