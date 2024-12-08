import { useGlobal } from '@/islands/Global.tsx';
import { useSignal, useSignalEffect } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { Meth } from '@/lib/meth.ts';

export function UserMenu() {
  const global = useGlobal();
  const popover = useRef<HTMLDivElement>(null);
  const isOpen = useSignal(false);

  const checkPopoverState = () => {
    isOpen.value = !!popover.current?.matches(':popover-open');
  };
  useEffect(() => {
    popover.current?.addEventListener('toggle', checkPopoverState);
    return () => popover.current?.removeEventListener('toggle', checkPopoverState);
  }, [popover.current]);

  return (
    <>
      {global.user.value
        ? (
          <button class='trigger link' popovertarget='user-menu-dropdown'>
            {isOpen.value ? '▾' : '▸'} {Meth.limitText(global.user.value?.name, 15)}
          </button>
        )
        : <a href='/user/signin'>Sign In</a>}
      {global.user.value && (
        <div popover ref={popover} class='dropdown' id='user-menu-dropdown'>
          <ul>
            <li>
              <a href='/user'>Settings</a>
            </li>
            <li>
              {!global.user.value?.isSubscribed && global.stripeEnabled && (
                <a href='/user/subscribe' target='_blank'>Subscribe</a>
              )}
            </li>
            <li>
              <a href='/user/signout'>Sign Out</a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
