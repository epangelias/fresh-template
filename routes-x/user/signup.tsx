import { define } from '@/lib/utils.ts';
import { page } from 'fresh';
import { authorizeUser, createUser } from '@/lib/user-data.ts';
import { SignupForm } from '@/components/SiginupForm.tsx';
import { sendEmailVerification } from '@/lib/mail.ts';
import { SetAuthCookie } from './signin.tsx';
import { Meth } from '@/lib/meth.ts';
import { Page } from '@/components/Page.tsx';
import { RateLimiter } from '@/lib/rate-limiter.ts';

const limiter = new RateLimiter();

export const handler = define.handlers({
  POST: async (ctx) => {
    await new Promise((r) => setTimeout(r, 1000));

    limiter.request();

    const { name, email, password } = Meth.formDataToObject(await ctx.req.formData());

    try {
      const user = await createUser(name, email, password);

      try {
        await sendEmailVerification(ctx.url.origin, user);
      } catch (_e) {} // Do nothing if rate limited to send email

      const authCode = await authorizeUser(email, password);
      if (authCode) return SetAuthCookie(ctx, authCode);

      throw new Error('Error authorizing user');
    } catch (e) {
      return page({ error: Meth.getErrorMessage(e), name, email });
    }
  },
});

export default define.page<typeof handler>(({ data }) => (
  <Page>
    <div>
      <h1>Sign Up</h1>
      <SignupForm error={data?.error} email={data?.email} name={data?.name} />
    </div>
  </Page>
));