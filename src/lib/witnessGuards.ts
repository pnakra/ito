// Narrow check: does the text show the writer took part in sexual contact?
// Used to force the witness frame back to "self". Keep this narrow on purpose.
const SUBJECT = String.raw`(?:\bi\b|\bwe\b|\bboth of us\b|\b[a-z']+ and (?:i|me)\b|\bme and [a-z']+(?: [a-z']+)?)`;
const FILLER = String.raw`(?:\s+(?:also|both|all|kinda|kind of|just))*`;
const VERB = String.raw`\s+(?:hooked up|had sex|slept with|made out with|got with|took turns|joined in)\b`;
const PATTERN = new RegExp(SUBJECT + FILLER + VERB, "i");

export function looksSelfInvolved(text: string): boolean {
  return PATTERN.test(text ?? "");
}
