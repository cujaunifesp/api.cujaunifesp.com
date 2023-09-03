import { testeDoCI } from "./ci";

test("Testando o CI", () => {
  expect(testeDoCI()).toBe(100);
});
