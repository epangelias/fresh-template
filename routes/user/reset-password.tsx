import { Page } from '@/components/Page.tsx';
import { define } from '@/lib/utils.ts';
import { Field } from '@/lib/components/Field.tsx';
import { HttpError, page } from 'fresh';
import { generatePassword, getUserByPasswordResetCode, removePasswordResetCode, setUserData } from '@/lib/user-data.ts';
import { STATUS_CODE } from '@std/http/status';
import { Meth } from '@/lib/meth.ts';

export const handler = define.handlers({
  GET: (ctx) => {
    const code = ctx.url.searchParams.get('code');
    if (!code) throw new HttpError(STATUS_CODE.Unauthorized);
    return page();
  },
  POST: async (ctx) => {
    try {
      const code = ctx.url.searchParams.get('code');
      const { password } = Meth.formDataToObject(await ctx.req.formData());
      if (!code || !password) throw new HttpError(STATUS_CODE.BadRequest, 'Missing code or password');
      const user = await getUserByPasswordResetCode(code);
      if (!user) throw new HttpError(STATUS_CODE.NotFound, 'Invalid reset code');
      const hashed = await generatePassword(password);
      await setUserData({ ...user, ...hashed });
      await removePasswordResetCode(code);
      return ctx.redirect('/user/signin');
    } catch (e) {
      return page({ error: Meth.getErrorMessage(e) });
    }
  },
});

export default define.page<typeof handler>(({ data }) => (
  <Page>
    <h1>Reset Password</h1>
    <form method='post'>
      <Field name='password' type='password' label='Password' required />
      <button type='submit'>Reset</button>
      {data?.error ? <p class='error-message'>{data.error}</p> : ''}
    </form>
  </Page>
));