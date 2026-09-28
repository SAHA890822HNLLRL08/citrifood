import "./globals.css";
export const metadata={
 title:"CitriFood",
 description:"Comida local, rápido y cerca de ti",
 applicationName:"CitriFood",
 manifest:"/manifest.webmanifest",
 appleWebApp:{capable:true,statusBarStyle:"default",title:"CitriFood"},
 formatDetection:{telephone:false}
};
export const viewport={themeColor:"#1f9d55",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}){return <html lang="es"><body>{children}</body></html>}