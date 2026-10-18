import { Toaster, Toast, ToastTitle, useToastController } from '@fluentui/react-components';
import Desktop from './desktop/Desktop';

export const TOASTER_ID = 'launcher';

export default function App() {
  const { dispatchToast } = useToastController(TOASTER_ID);

  return (
    <>
      <Toaster toasterId={TOASTER_ID} position="bottom-end" />
      <Desktop
        notify={(text) =>
          dispatchToast(
            <Toast>
              <ToastTitle>{text}</ToastTitle>
            </Toast>,
            { timeout: 2500 },
          )
        }
      />
    </>
  );
}
