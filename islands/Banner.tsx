import { IS_BROWSER } from 'fresh/runtime';
import { useGlobal } from '@/islands/Global.tsx';
import { useSignal } from '@preact/signals';
import { ComponentChildren } from 'preact';

export function Banners() {
    const global = useGlobal();

    const outOfTokens = global.value.user?.tokens! <= 0 && !global.value.user?.isSubscribed;

    if (!IS_BROWSER) return <></>;
    if (!global.value.user?.hasVerifiedEmail && outOfTokens) {
        return (
            <Banner name='subscribe' canClose={false}>
                <a href='/user/resend-email'>Verify email</a> for more tokens
            </Banner>
        );
    } else if (global.value.user?.hasVerifiedEmail && outOfTokens) {
        return (
            <Banner name='subscribe' canClose={false}>
                <a href='/user/subscribe' target='_blank'>Subscribe</a> for unlimited tokens
            </Banner>
        );
    } else if (!isPWA()) {
        if (isIOSSafari()) {
            return (
                <Banner name='ios-install'>
                    <a href='/install-guide-ios'>Install this app to your device</a>
                </Banner>
            );
        }
    }
    return <></>;
}

export function Banner(
    { children, name, canClose = true }: {
        children: ComponentChildren;
        name: string;
        canClose?: boolean;
    },
) {
    const hideBanner = useSignal(!!localStorage.getItem('hideBanner-' + name));

    if (hideBanner.value) return <></>;

    function onClose() {
        localStorage.setItem('hideBanner-' + name, '1');
        hideBanner.value = true;
    }

    return (
        <div class='banner'>
            {children}
            {canClose && <button onClick={onClose}>×</button>}
        </div>
    );
}

function isIOSSafari(): boolean {
    const userAgent = globalThis.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    return isIOS && isSafari;
}

function isPWA(): boolean {
    if (IS_BROWSER) return false;
    const isStandalone = globalThis?.matchMedia('(display-mode: standalone)').matches;
    const isPWAFromManifest = 'serviceWorker' in navigator && 'PushManager' in window;

    return isStandalone || isPWAFromManifest;
}