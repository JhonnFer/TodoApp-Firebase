import { 
  DarkTheme, 
  DefaultTheme, 
  ThemeProvider, 
} from "@react-navigation/native"; 
import { useFonts } from "expo-font"; 
import { Stack, useRouter, useSegments } from "expo-router"; 
import * as SplashScreen from "expo-splash-screen"; 
import { useEffect, useState } from "react"; 
import { ActivityIndicator, View } from "react-native"; 
import "react-native-reanimated"; 
import { useColorScheme } from "@/hooks/use-color-scheme"; 
import { container } from "@/src/di/container"; 
import { useAuth } from "@/src/presentation/hooks/useAuth"; 

SplashScreen.preventAutoHideAsync(); 

export default function RootLayout() { 
  const colorScheme = useColorScheme(); 
  const [loaded] = useFonts({ 
    SpaceMono: require("@/assets/fonts/SpaceMono-BoldItalic.ttf"), 
  }); 
  const [containerReady, setContainerReady] = useState(false); 
  const { user, loading: authLoading } = useAuth(); 
  const segments = useSegments() as string[]; 
  const router = useRouter(); 
  
  useEffect(() => { 
    const initContainer = async () => { 
      try { 
        await container.initialize(); 
        setContainerReady(true); 
      } catch (error) { 
        console.error("Error initializing container:", error); 
      } 
    }; 
    
    initContainer(); 
  }, []); 
  
  // 🚀 CORRECCIÓN: Protección de rutas 
  useEffect(() => { 
    if (!containerReady || authLoading) return; 
    
    // Definición de TODAS las rutas que se pueden visitar sin autenticación
    const isPublicRoute =
      // Rutas dentro de (tabs)
      (segments[0] === "(tabs)" &&
      (segments[1]?.toLowerCase() === "login" || segments[1]?.toLowerCase() === "register")) ||
      // ✅ Rutas fuera de (tabs)
      segments[0] === "forgot-password"; 
    
    if (!user && !isPublicRoute) { 
      // Usuario no autenticado intenta acceder a ruta protegida 
      router.replace("/(tabs)/login"); 
    } else if (user && isPublicRoute) { 
      // Usuario autenticado intenta acceder a login/register/forgot-password 
      router.replace("/(tabs)/todos"); 
    } 
  }, [user, segments, containerReady, authLoading]); 
  
  useEffect(() => { 
    if (loaded && containerReady && !authLoading) { 
      SplashScreen.hideAsync(); 
    } 
  }, [loaded, containerReady, authLoading]); 
  
  if (!loaded || !containerReady || authLoading) { 
    return ( 
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}> 
        <ActivityIndicator size="large" /> 
      </View> 
    ); 
  } 
  
  return ( 
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}> 
      <Stack screenOptions={{ headerShown: false }}> 
        <Stack.Screen name="(tabs)/login" /> 
        <Stack.Screen name="(tabs)/register" /> 
        <Stack.Screen name="(tabs)/todos" /> 
        
        {/* ✅ CORRECCIÓN: Habilitar el encabezado para tener botón de regreso */}
        <Stack.Screen 
            name="forgot-password" 
            options={{ 
                headerShown: true, // Cambiado a 'true'
                title: "Recuperar Contraseña"
            }} 
        />
      </Stack> 
    </ThemeProvider> 
  ); 
}