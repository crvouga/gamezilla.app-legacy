import { describe, expect, test } from 'bun:test'
import { UserRole } from 'gamezilla-app/app/@/data'
import { FlowClientFixture } from '../../testing'

const Fixture = async (input?: { currentUserRole: UserRole }) => {
  const f = await FlowClientFixture()
  const ctx: typeof f.ctx = {
    ...f.ctx,
    currentUserRole: input?.currentUserRole ?? 'super'
  }

  return {
    ...f,
    ctx
  }
}

describe(import.meta.file, () => {
  test.todo('render button for super users', async () => {
    const f = await Fixture()
    const r = f.render(f.initial)
    const button = r.getByRole('button', f.ctx.t('flow.copy-puzzle-to-clipboard'))
    expect(button).toBeTruthy()
  })

  test.todo('does not render button for non-super users', async () => {
    for (const currentUserRole of UserRole.NON_SUPER_USER_ROLES) {
      const f = await Fixture({
        currentUserRole
      })
      const r = f.render(f.initial)
      const button = r.getByRole('button', f.ctx.t('flow.copy-puzzle-to-clipboard'))
      expect(button).toBeFalsy()
    }
  })

  // test("play sound", async () => {
  // 	const f = await Fixture();
  // 	const output = f.update(f.initial, [
  // 		{
  // 			msgCore: withEventMeta({
  // 				t: "user-clicked-copy-to-clipboard",
  // 			}),
  // 		},
  // 	]);
  // 	expect(didPlaySound(output)).toBe(true);
  // });

  // test("copy puzzle to clipboard", async () => {
  // 	const f = await Fixture();
  // 	const output = f.update(f.initial, [
  // 		{
  // 			msgCore: withEventMeta({
  // 				t: "user-clicked-copy-to-clipboard",
  // 			}),
  // 		},
  // 	]);
  // 	expect(didCopyToClipboard(output)).toBe(true);
  // });

  // test("show toast on copy success", async () => {
  // 	const f = await Fixture();
  // 	const output = f.update(f.initial, [
  // 		{
  // 			msgCore: withEventMeta({
  // 				t: "user-clicked-copy-to-clipboard",
  // 			}),
  // 		},
  // 	]);
  // 	expect(didShowToast(output)).toBe(true);
  // });

  // it("should copy the shorthand json to the clipboard", async () => {
  // 	const f = await Fixture();
  // 	const output = f.update(f.initial, [
  // 		{
  // 			msgCore: withEventMeta({
  // 				t: "user-clicked-copy-to-clipboard",
  // 			}),
  // 		},
  // 	]);
  // 	expect(
  // 		didCopyToClipboard(output, (text) => {
  // 			const shorthand = JSON.parse(text);
  // 			const grid = FlowGridShorthand.toGrid(shorthand);
  // 			return Flow.isSame(f.puzzle.flow, grid);
  // 		}),
  // 	).toBe(true);
  // });
})
