/**
 * MTKruto - Cross-runtime JavaScript library for building Telegram clients
 * Copyright (C) 2023-2025 Roj <https://roj.im/>
 *
 * This file is part of MTKruto.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { assertEquals } from "../0_deps.ts";
import { TLRawWriter } from "./0_tl_raw_writer.ts";

Deno.test("TLRawWriter", async (t) => {
  const writer = new TLRawWriter();
  let wrote = 0;

  await t.step("write", () => {
    writer.write(new Uint8Array([0x00]));

    const size = 1;
    wrote += size;

    const expected = new Uint8Array([0x00]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeInt24", () => {
    const size = 3 * 2;

    writer.writeInt24(8388607, false);
    writer.writeInt24(-8388607);

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0xFF, 0xFF, 0x7F, // uint24
      0x01, 0x00, 0x80, // int24
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeInt32", () => {
    const size = 4 * 2;

    writer.writeInt32(0xFFFFEECC, false);
    writer.writeInt32(-0x010001);

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0xCC, 0xEE, 0xFF, 0xFF, // uint32
      0xFF, 0xFF, 0xFE, 0xFF, // int32
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeInt64", () => {
    const size = 8 * 2;

    writer.writeInt64(17221708751939633000n, false);
    writer.writeInt64(-9223372036854775807n);

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0x68, 0xFF, 0x98, 0x88, 0xDD, 0xCC, 0xFF, 0xEE, // uint64
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x80, // int64
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeDouble", () => {
    const size = 8;

    writer.writeDouble(-11.032);

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0xAA, 0xF1, 0xD2, 0x4D, 0x62, 0x10, 0x26, 0xC0, // double
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeInt128", () => {
    const size = 16 * 2;

    writer.writeInt128(276480700075363207293378760200953856909n, false);
    writer.writeInt128(9879767416712888958949374238624101143n);

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0x8D, 0x03, 0xBD, 0x3C, 0x55, 0x22, 0xA5, 0x05,
      0xD6, 0xDC, 0xC4, 0x66, 0xF5, 0x3E, 0x00, 0xD0, // uint128
      0x17, 0xB3, 0x50, 0x37, 0x1C, 0xAD, 0x8A, 0xDF,
      0xE5, 0x02, 0x96, 0x48, 0x24, 0xC6, 0x6E, 0x07, // int128
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeInt256", () => {
    const size = 32 * 2;

    writer.writeInt256(106798601566956061778213567770381794524206942780088236271152238178577682442589n, false);
    writer.writeInt256(43297618943045001998167677499050563319748616773287013753630609307270848223740n);

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0x5D, 0xA9, 0x9E, 0xC6, 0xB0, 0xD6, 0x82, 0x3F,
      0xE8, 0x43, 0x78, 0x19, 0xFD, 0x3D, 0x25, 0xAB,
      0x13, 0xEB, 0x8A, 0x60, 0x4F, 0xA7, 0xB1, 0x3B,
      0x17, 0x9C, 0x70, 0x2B, 0xCA, 0xDD, 0x1D, 0xEC, // uint256
      0xFC, 0x99, 0xB0, 0x57, 0xDA, 0x4B, 0x6E, 0xFD,
      0x35, 0x34, 0x69, 0xEC, 0x59, 0x24, 0x40, 0x60,
      0x41, 0x98, 0x0D, 0x97, 0xA6, 0xA2, 0x96, 0x1E,
      0x95, 0xCE, 0xC6, 0xEF, 0x78, 0x95, 0xB9, 0x5F, // int256
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeBytes", () => {
    const size = 4 + (1 + 3 + 255 + 1);

    writer.writeBytes(new Uint8Array([0xFF]));
    // deno-fmt-ignore
    writer.writeBytes(
      new Uint8Array([
        0xFB, 0x42, 0xF5, 0xF7, 0xE7, 0xBC, 0xE5, 0x8F,
        0x55, 0x71, 0x59, 0x87, 0x11, 0xD4, 0xDE, 0x7E,
        0x7B, 0xD4, 0x9A, 0x9C, 0x12, 0x89, 0xEF, 0xB9,
        0x91, 0x2A, 0x74, 0x7D, 0x2C, 0x34, 0xE5, 0x7D,
        0x1F, 0x5B, 0x48, 0x6F, 0xF0, 0xFA, 0x6D, 0x3E,
        0x87, 0xDC, 0xB1, 0x5C, 0x5F, 0x9D, 0x65, 0xD3,
        0x1B, 0x8A, 0x63, 0xE3, 0xD8, 0x94, 0x08, 0xDE,
        0xC3, 0x4C, 0x2D, 0x1C, 0xCF, 0x78, 0x3D, 0x6E,
        0x2E, 0x65, 0xAB, 0x10, 0x36, 0x9B, 0x22, 0x20,
        0xC4, 0x1E, 0x96, 0x73, 0x67, 0x32, 0x54, 0xFB,
        0x4D, 0x7A, 0xA0, 0xDB, 0x81, 0xEA, 0x9D, 0x5D,
        0x8D, 0x6A, 0xBD, 0xAD, 0x92, 0xB1, 0x82, 0x46,
        0x93, 0x65, 0x55, 0xC5, 0x05, 0x9F, 0x90, 0x65,
        0x7A, 0xBB, 0xF3, 0x38, 0x4D, 0x2E, 0xAB, 0xCD,
        0xC4, 0xF9, 0xF7, 0x5B, 0xF7, 0x68, 0x84, 0x5E,
        0x27, 0xB2, 0x33, 0x1F, 0x33, 0x1C, 0xEE, 0x52,
        0xA3, 0xDF, 0x27, 0x86, 0xA6, 0xB5, 0xD8, 0x56,
        0x72, 0x44, 0x2D, 0x21, 0x7A, 0x0F, 0x0D, 0x47,
        0xA4, 0x7D, 0x2D, 0x01, 0x23, 0x03, 0x0F, 0x15,
        0x5D, 0xF7, 0x1D, 0xCF, 0x4C, 0xF8, 0xFF, 0x39,
        0xBA, 0xDB, 0xBB, 0x67, 0x06, 0x55, 0x82, 0xE9,
        0x5F, 0x10, 0xA1, 0xEB, 0x7A, 0xEC, 0x9F, 0x9B,
        0x18, 0x7D, 0x90, 0x23, 0xB5, 0x31, 0xD6, 0x41,
        0x1A, 0xD0, 0x2F, 0xD8, 0x86, 0xBB, 0xF6, 0x93,
        0x34, 0x54, 0x3F, 0xEB, 0xF4, 0x19, 0x5A, 0x19,
        0x49, 0xBF, 0x84, 0xCF, 0xAE, 0xA8, 0xF4, 0xF6,
        0xAE, 0xBD, 0xB5, 0x28, 0xA9, 0xCA, 0x87, 0x6D,
        0xB5, 0x54, 0x2F, 0x37, 0x79, 0xD6, 0xDB, 0x87,
        0xEB, 0x20, 0xE1, 0x7C, 0x75, 0x71, 0x49, 0xE2,
        0xA0, 0xAD, 0xF2, 0x2F, 0xFF, 0xC1, 0x19, 0x8B,
        0xF0, 0x84, 0xDC, 0xF3, 0xC5, 0x12, 0xAB, 0xA5,
        0x5A, 0xD5, 0xFD, 0x89, 0x5E, 0x02, 0xD3
      ]),
    );

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0x01, 0xFF, 0x00, 0x00, // less than 254 bytes
      0xFE, 0xFF, 0x00, 0x00, 0xFB, 0x42, 0xF5, 0xF7,
      0xE7, 0xBC, 0xE5, 0x8F, 0x55, 0x71, 0x59, 0x87,
      0x11, 0xD4, 0xDE, 0x7E, 0x7B, 0xD4, 0x9A, 0x9C,
      0x12, 0x89, 0xEF, 0xB9, 0x91, 0x2A, 0x74, 0x7D,
      0x2C, 0x34, 0xE5, 0x7D, 0x1F, 0x5B, 0x48, 0x6F,
      0xF0, 0xFA, 0x6D, 0x3E, 0x87, 0xDC, 0xB1, 0x5C,
      0x5F, 0x9D, 0x65, 0xD3, 0x1B, 0x8A, 0x63, 0xE3,
      0xD8, 0x94, 0x08, 0xDE, 0xC3, 0x4C, 0x2D, 0x1C,
      0xCF, 0x78, 0x3D, 0x6E, 0x2E, 0x65, 0xAB, 0x10,
      0x36, 0x9B, 0x22, 0x20, 0xC4, 0x1E, 0x96, 0x73,
      0x67, 0x32, 0x54, 0xFB, 0x4D, 0x7A, 0xA0, 0xDB,
      0x81, 0xEA, 0x9D, 0x5D, 0x8D, 0x6A, 0xBD, 0xAD,
      0x92, 0xB1, 0x82, 0x46, 0x93, 0x65, 0x55, 0xC5,
      0x05, 0x9F, 0x90, 0x65, 0x7A, 0xBB, 0xF3, 0x38,
      0x4D, 0x2E, 0xAB, 0xCD, 0xC4, 0xF9, 0xF7, 0x5B,
      0xF7, 0x68, 0x84, 0x5E, 0x27, 0xB2, 0x33, 0x1F,
      0x33, 0x1C, 0xEE, 0x52, 0xA3, 0xDF, 0x27, 0x86,
      0xA6, 0xB5, 0xD8, 0x56, 0x72, 0x44, 0x2D, 0x21,
      0x7A, 0x0F, 0x0D, 0x47, 0xA4, 0x7D, 0x2D, 0x01,
      0x23, 0x03, 0x0F, 0x15, 0x5D, 0xF7, 0x1D, 0xCF,
      0x4C, 0xF8, 0xFF, 0x39, 0xBA, 0xDB, 0xBB, 0x67,
      0x06, 0x55, 0x82, 0xE9, 0x5F, 0x10, 0xA1, 0xEB,
      0x7A, 0xEC, 0x9F, 0x9B, 0x18, 0x7D, 0x90, 0x23,
      0xB5, 0x31, 0xD6, 0x41, 0x1A, 0xD0, 0x2F, 0xD8,
      0x86, 0xBB, 0xF6, 0x93, 0x34, 0x54, 0x3F, 0xEB,
      0xF4, 0x19, 0x5A, 0x19, 0x49, 0xBF, 0x84, 0xCF,
      0xAE, 0xA8, 0xF4, 0xF6, 0xAE, 0xBD, 0xB5, 0x28,
      0xA9, 0xCA, 0x87, 0x6D, 0xB5, 0x54, 0x2F, 0x37,
      0x79, 0xD6, 0xDB, 0x87, 0xEB, 0x20, 0xE1, 0x7C,
      0x75, 0x71, 0x49, 0xE2, 0xA0, 0xAD, 0xF2, 0x2F,
      0xFF, 0xC1, 0x19, 0x8B, 0xF0, 0x84, 0xDC, 0xF3,
      0xC5, 0x12, 0xAB, 0xA5, 0x5A, 0xD5, 0xFD, 0x89,
      0x5E, 0x02, 0xD3, 0x00, // more than 254 bytes
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });

  await t.step("writeString", () => {
    const size = 4 + (1 + 3 + 259 + 1);

    writer.writeString("R");
    writer.writeString("MTKruto".repeat(37));

    wrote += size;

    // deno-fmt-ignore
    const expected = new Uint8Array([
      0x01, 0x52, 0x00, 0x00, // string with less than 254 bytes
      0xFE, 0x03, 0x01, 0x00, 0x4D, 0x54, 0x4B, 0x72,
      0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75,
      0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74,
      0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F,
      0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D,
      0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54,
      0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B,
      0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72,
      0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75,
      0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74,
      0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F,
      0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D,
      0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54,
      0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B,
      0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72,
      0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75,
      0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74,
      0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F,
      0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D,
      0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54,
      0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B,
      0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72,
      0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75,
      0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74,
      0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F,
      0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D,
      0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54,
      0x4B, 0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B,
      0x72, 0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72,
      0x75, 0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75,
      0x74, 0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74,
      0x6F, 0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F,
      0x4D, 0x54, 0x4B, 0x72, 0x75, 0x74, 0x6F, 0x00 // string with more than 254 bytes
    ]);
    assertEquals(writer.buffer.subarray(wrote - size), expected);
    assertEquals(writer.buffer.length, wrote);
  });
});
