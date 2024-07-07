import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { ThemedText } from "../components/ThemedText";
import { useSession } from '../hooks/auth/authContext';

export default function SignIn() {
  const { signIn } = useSession();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText
        onPress={() => {
          signIn().then(() => {
            router.replace('/');
          }).catch(error => {
            console.error('Failed to sign in', error);
            // Handle error state here
          });
        }}>
        Kirjaudu sissään
      </ThemedText>
    </View>
  );
}
