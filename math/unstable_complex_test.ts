// Copyright 2018-2026 the Deno authors. MIT license.
import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertFalse,
} from "@std/assert";
import { Complex } from "./unstable_complex.ts";

function assertAlmostEqualComplex(
  actual: Complex,
  expected: Complex,
  tolerance?: number,
) {
  assertAlmostEquals(actual.real, expected.real, tolerance);
  assertAlmostEquals(actual.imag, expected.imag, tolerance);
}

Deno.test("Complex", async (t) => {
  await t.step("constructor", async (t) => {
    await t.step("Basic", () => {
      assertEquals(new Complex(1, 0), Complex.one);
      assertEquals(new Complex(5, 1).imag, 1);
      assertEquals(new Complex(5, 1).real, 5);
    });

    await t.step("NaN", () => {
      assertEquals(new Complex(NaN, 1), Complex.NaN);
      assertEquals(new Complex(1, NaN), Complex.NaN);
      assertEquals(new Complex(NaN, NaN), Complex.NaN);
    });

    await t.step("Infinity", () => {
      assertEquals(new Complex(Infinity, 1), Complex.Infinity);
      assertEquals(new Complex(1, -Infinity), Complex.Infinity);
      assertEquals(new Complex(Infinity, -Infinity), Complex.Infinity);
      assertEquals(new Complex(Infinity, NaN), Complex.Infinity);
      assertEquals(new Complex(NaN, Infinity), Complex.Infinity);
    });
  });

  await t.step("Utility functions", async (t) => {
    await t.step("isReal()", () => {
      assertFalse(new Complex(4, 4).isReal());
      assert(new Complex(4).isReal());
      assert(new Complex(4, 1e-16).isReal(1e-15));
      assertFalse(Complex.Infinity.isReal());
      assertFalse(Complex.NaN.isReal());
    });

    await t.step("isImaginary()", () => {
      assertFalse(new Complex(4, 4).isImaginary());
      assert(new Complex(0, 4).isImaginary());
      assert(new Complex(1e-16, 4).isImaginary(1e-15));
      assertFalse(Complex.Infinity.isImaginary());
      assertFalse(Complex.NaN.isImaginary());
    });

    await t.step("isZero()", () => {
      assert(Complex.zero.isZero());
      assertFalse(new Complex(0, 4).isZero());
      assertFalse(new Complex(-1, 4).isZero());
      assert(new Complex(0, 1.6e-16).isZero(1e-15));
    });

    await t.step("isFinite()", () => {
      assert(new Complex(0, 0).isFinite());
      assert(new Complex(0, 4).isFinite());
      assertFalse(new Complex(NaN, 4).isFinite());
      assertFalse(new Complex(NaN, Infinity).isFinite());
      assertFalse(new Complex(8, Infinity).isFinite());
    });

    await t.step("isInfinite()", () => {
      assertFalse(new Complex(0).isInfinite());
      assertFalse(new Complex(0, 4).isInfinite());
      assertFalse(new Complex(NaN, 4).isInfinite());
      assert(new Complex(NaN, Infinity).isInfinite());
      assert(new Complex(8, Infinity).isInfinite());
    });

    await t.step("isNaN()", () => {
      assertFalse(new Complex(0, 0).isNaN());
      assertFalse(new Complex(0, 4).isNaN());
      assert(new Complex(NaN, 4).isNaN());
      assertFalse(new Complex(NaN, Infinity).isNaN());
      assertFalse(new Complex(8, Infinity).isNaN());
    });

    await t.step("equals()", () => {
      assert(new Complex(0, 3).equals(new Complex(0, 3)));
      assert(new Complex(4, 3).equals(new Complex(4, 3 - 1e-16), 1e-15));
      assertFalse(new Complex(4, 3).equals(new Complex(4, 3 - 1e-15), 1e-16));
    });
  });

  await t.step("Basic arithmetic", async (t) => {
    await t.step("add()", () => {
      assertEquals(
        new Complex(3, 2).add(0).add(new Complex(4, 4)),
        new Complex(7, 6),
      );
      assertEquals(
        new Complex(5, 4).add(new Complex(Infinity, 2)),
        Complex.Infinity,
      );
      assertEquals(
        new Complex(NaN, 4).add(new Complex(Infinity, 2)),
        Complex.NaN,
      );
      assertEquals(
        new Complex(NaN, 4).add(new Complex(3, 2)),
        Complex.NaN,
      );
    });

    await t.step("neg()", () => {
      assertEquals(new Complex(-1, -2).neg(), new Complex(1, 2));
      assertEquals(new Complex(0, -2).neg(), new Complex(0, 2));
      assertEquals(Complex.zero.neg(), Complex.zero);
      assertEquals(Complex.NaN.neg(), Complex.NaN);
      assertEquals(Complex.Infinity.neg(), Complex.Infinity);
    });

    await t.step("sub()", () => {
      assertEquals(
        Complex.zero.sub(new Complex(3, 2)),
        new Complex(-3, -2),
      );
      assertEquals(
        new Complex(5, 4).sub(new Complex(Infinity, 2)),
        Complex.Infinity,
      );
      assertEquals(
        new Complex(NaN, 4).sub(new Complex(Infinity, 2)),
        Complex.NaN,
      );
      assertEquals(
        new Complex(NaN, 4).sub(new Complex(3, 2)),
        Complex.NaN,
      );
    });

    await t.step("mul()", () => {
      assertEquals(
        new Complex(3, 2).mul(new Complex(4, 4)),
        new Complex(4, 20),
      );
      assertEquals(
        new Complex(Infinity).sub(new Complex(4, 2)),
        Complex.Infinity,
      );
      assertEquals(
        Complex.Infinity.mul(Complex.zero),
        Complex.NaN,
      );
      assertEquals(
        new Complex(NaN, 4).sub(new Complex(Infinity, 2)),
        Complex.NaN,
      );
      assertEquals(
        new Complex(NaN, 4).sub(new Complex(3, 2)),
        Complex.NaN,
      );
    });

    await t.step("div()", () => {
      assertEquals(
        new Complex(4, 20).div(new Complex(4, 4)),
        new Complex(3, 2),
      );
      assertEquals(
        Complex.Infinity.div(new Complex(4, 2)),
        Complex.Infinity,
      );
      assertEquals(
        new Complex(4, 2).div(Complex.zero),
        Complex.Infinity,
      );
      assertEquals(
        Complex.NaN.div(Infinity),
        Complex.NaN,
      );
      assertEquals(
        Complex.NaN.div(new Complex(3, 2)),
        Complex.NaN,
      );
    });
  });

  await t.step("Basic complex functions", async (t) => {
    await t.step("recip()", () => {
      assertEquals(new Complex(1, 2).recip(), new Complex(.2, -.4));
      assertEquals(new Complex(0, -2).recip(), new Complex(0, .5));
      assertEquals(Complex.zero.recip(), Complex.Infinity);
      assertEquals(Complex.NaN.recip(), Complex.NaN);
      assertEquals(Complex.Infinity.recip(), Complex.zero);
    });

    await t.step("absSquared()", () => {
      assertEquals(new Complex(1, 2).absSquared(), 5);
      assertEquals(new Complex(0, -2).absSquared(), 4);
      assertEquals(Complex.zero.absSquared(), 0);
      assertEquals(Complex.NaN.absSquared(), NaN);
      assertEquals(Complex.Infinity.absSquared(), Infinity);
    });

    await t.step("abs()", () => {
      assertEquals(new Complex(1, 2).abs(), Math.sqrt(5));
      assertEquals(new Complex(0, -2).abs(), 2);
      assertEquals(Complex.zero.abs(), 0);
      assertEquals(Complex.NaN.abs(), NaN);
      assertEquals(Complex.Infinity.abs(), Infinity);
    });

    await t.step("arg()", () => {
      assertAlmostEquals(new Complex(1, 2).arg(), 1.107148718);
      assertEquals(new Complex(0, -2).arg(), -Math.PI / 2);
      assertEquals(Complex.zero.arg(), 0);
      assertEquals(Complex.NaN.arg(), NaN);
      assertEquals(Complex.Infinity.arg(), NaN);
    });

    await t.step("conj()", () => {
      assertEquals(new Complex(1, 2).conj(), new Complex(1, -2));
      assertEquals(new Complex(0, -2).conj(), new Complex(0, 2));

      const nums = [0, 1, 2, 3];
      for (const real of nums) {
        for (const imag of nums) {
          assertEquals(
            new Complex(real, imag).conj().conj(),
            new Complex(real, imag),
          );
        }
      }

      assertEquals(Complex.zero.conj(), Complex.zero);
      assertEquals(Complex.NaN.conj(), Complex.NaN);
      assertEquals(Complex.Infinity.conj(), Complex.Infinity);
    });
  });

  await t.step("Nonbasic arithmetic", async (t) => {
    await t.step("sqrt()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).sqrt(),
        new Complex(1.27201965, 0.78615138),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).sqrt(),
        new Complex(.78615138, 1.27201965),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).sqrt(),
        new Complex(1.27201965, -.78615138),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).sqrt(),
        new Complex(.78615138, -1.27201965),
      );

      assertEquals(
        Complex.one.sqrt(),
        Complex.one,
      );
      assertEquals(
        Complex.i.sqrt(),
        new Complex(Math.SQRT1_2, Math.SQRT1_2),
      );
      assertEquals(
        Complex.negOne.sqrt(),
        new Complex(0, 1),
      );
      assertEquals(
        Complex.negI.sqrt(),
        new Complex(Math.SQRT1_2, -Math.SQRT1_2),
      );

      const nums = [0, 1, 2, 3];
      for (const real of nums) {
        for (const imag of nums) {
          assertAlmostEqualComplex(
            new Complex(real, imag).sqrt().pow(2),
            new Complex(real, imag),
            1e-15,
          );
        }
      }

      assertEquals(Complex.zero.sqrt(), Complex.zero);
      assertEquals(Complex.NaN.sqrt(), Complex.NaN);
      assertEquals(Complex.Infinity.sqrt(), Complex.Infinity);
    });

    await t.step("cbrt()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).cbrt(),
        new Complex(1.21961651, .47171127),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).cbrt(),
        new Complex(1.0183222, .82036324),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).cbrt(),
        new Complex(1.21961651, -.47171127),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).cbrt(),
        new Complex(1.0183222, -.82036324),
      );

      const nums = [0, 1, 2, 3];
      for (const real of nums) {
        for (const imag of nums) {
          assertAlmostEqualComplex(
            new Complex(real, imag).cbrt().pow(3),
            new Complex(real, imag),
            2e-15,
          );
        }
      }

      assertEquals(Complex.zero.cbrt(), Complex.zero);
      assertEquals(Complex.NaN.cbrt(), Complex.NaN);
      assertEquals(Complex.Infinity.cbrt(), Complex.Infinity);
    });

    await t.step("ln()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).ln(),
        new Complex(.80471896, 1.10714872),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).ln(),
        new Complex(.80471896, 2.03444394),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).ln(),
        new Complex(.80471896, -1.10714872),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).ln(),
        new Complex(.80471896, -2.03444394),
      );
      assertAlmostEqualComplex(
        new Complex(-1).ln(),
        new Complex(0, Math.PI),
      );

      assertEquals(Complex.zero.ln(), Complex.NaN);
      assertEquals(Complex.NaN.ln(), Complex.NaN);
      assertEquals(Complex.Infinity.ln(), Complex.Infinity);
    });

    await t.step("log()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).log(),
        new Complex(.349485, .48082858),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).log(),
        new Complex(.349485, .88354778),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).log(),
        new Complex(.349485, -.48082858),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).log(),
        new Complex(.349485, -.88354778),
      );
      assertEquals(Complex.zero.log(), Complex.NaN);
      assertEquals(Complex.NaN.log(), Complex.NaN);
      assertEquals(Complex.Infinity.log(), Complex.Infinity);
    });

    await t.step("logn()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).logn(2),
        new Complex(1.16096405, 1.59727796),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).logn(3),
        new Complex(.73248676, 1.85183067),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).logn(4),
        new Complex(.58048202, -.79863898),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).logn(5),
        new Complex(.5, -1.26407109),
      );
      for (const base of [2, 3, 4, 5, 6]) {
        assertEquals(Complex.zero.logn(base), Complex.NaN);
        assertEquals(Complex.NaN.logn(base), Complex.NaN);
        assertEquals(Complex.Infinity.logn(base), Complex.Infinity);
      }
    });

    await t.step("exp()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).exp(),
        new Complex(-1.13120438, 2.47172667),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).exp(),
        new Complex(-.15309187, .33451183),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).exp(),
        new Complex(-1.13120438, -2.47172667),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).exp(),
        new Complex(-.15309187, -.33451183),
      );
      assertAlmostEqualComplex(
        new Complex(0, Math.PI).exp(),
        Complex.negOne,
        1e-15,
      );
      assertAlmostEqualComplex(
        new Complex(0, 2 * Math.PI).exp(),
        Complex.one,
        1e-15,
      );

      const nums = [1, 2, 3, 4];
      for (const real of nums) {
        for (const imag of nums) {
          assertAlmostEqualComplex(
            new Complex(real, imag).ln().exp(),
            new Complex(real, imag),
            1e-15,
          );
        }
      }

      assertEquals(Complex.zero.exp(), Complex.one);
      assertEquals(Complex.NaN.exp(), Complex.NaN);
      assertEquals(Complex.Infinity.exp(), Complex.NaN);
    });

    await t.step("pow()", () => {
      const w = new Complex(3, 4);
      assertAlmostEqualComplex(
        new Complex(1, 2).pow(w),
        new Complex(.12900959, .03392409),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).pow(w),
        new Complex(-.0032506884, .0003345984),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).pow(w),
        new Complex(932.139195, -95.9465337),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).pow(w),
        new Complex(-36993.6705, -9727.77819),
      );
      assertEquals(Complex.zero.pow(Complex.zero), Complex.one);
      assertEquals(Complex.NaN.pow(new Complex(2, 3)), Complex.NaN);
      assertEquals(Complex.Infinity.pow(new Complex(4, 5)), Complex.NaN);
    });
  });

  await t.step("Trigonometric functions", async (t) => {
    await t.step("sin()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).sin(),
        new Complex(3.16577851, 1.95960104),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).sin(),
        new Complex(-3.16577851, 1.95960104),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).sin(),
        new Complex(3.16577851, -1.95960104),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).sin(),
        new Complex(-3.16577851, -1.95960104),
      );
      assertEquals(Complex.zero.sin(), Complex.zero);
      assertEquals(Complex.NaN.sin(), Complex.NaN);
      assertEquals(Complex.Infinity.sin(), Complex.NaN);
    });

    await t.step("cos()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).cos(),
        new Complex(2.03272301, -3.0518978),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).cos(),
        new Complex(2.03272301, 3.0518978),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).cos(),
        new Complex(2.03272301, 3.0518978),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).cos(),
        new Complex(2.03272301, -3.0518978),
      );
      assertEquals(Complex.zero.cos(), Complex.one);
      assertEquals(Complex.NaN.cos(), Complex.NaN);
      assertEquals(Complex.Infinity.cos(), Complex.NaN);
    });

    await t.step("tan()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).tan(),
        new Complex(.0338128260, 1.0147936161),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).tan(),
        new Complex(-.0338128260, 1.0147936161),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).tan(),
        new Complex(.0338128260, -1.0147936161),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).tan(),
        new Complex(-.0338128260, -1.0147936161),
      );
      assertEquals(Complex.zero.tan(), Complex.zero);
      assertEquals(Complex.NaN.tan(), Complex.NaN);
      assertEquals(Complex.Infinity.tan(), Complex.NaN);
    });

    await t.step("cot()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).cot(),
        new Complex(0.0327977555, -0.984329226),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).cot(),
        new Complex(-0.0327977555, -0.984329226),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).cot(),
        new Complex(0.0327977555, 0.984329226),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).cot(),
        new Complex(-0.0327977555, 0.984329226),
      );
      assertEquals(Complex.zero.cot(), Complex.Infinity);
      assertEquals(Complex.NaN.cot(), Complex.NaN);
      assertEquals(Complex.Infinity.cot(), Complex.NaN);
    });

    await t.step("sec()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).sec(),
        new Complex(.1511762982, .2269736753),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).sec(),
        new Complex(.1511762982, -.2269736753),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).sec(),
        new Complex(.1511762982, -.2269736753),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).sec(),
        new Complex(.1511762982, .2269736753),
      );
      assertEquals(Complex.zero.sec(), Complex.one);
      assertEquals(Complex.NaN.sec(), Complex.NaN);
      assertEquals(Complex.Infinity.sec(), Complex.NaN);
    });

    await t.step("csc()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).csc(),
        new Complex(.2283750655, -.1413630216),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).csc(),
        new Complex(-.2283750655, -.1413630216),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).csc(),
        new Complex(.2283750655, .1413630216),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).csc(),
        new Complex(-.2283750655, .1413630216),
      );
      assertEquals(Complex.zero.csc(), Complex.Infinity);
      assertEquals(Complex.NaN.csc(), Complex.NaN);
      assertEquals(Complex.Infinity.csc(), Complex.NaN);
    });
  });

  await t.step("Hyperbolic trigonometric functions", async (t) => {
    await t.step("sinh()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).sinh(),
        new Complex(-.48905626, 1.40311925),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).sinh(),
        new Complex(0.48905626, 1.40311925),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).sinh(),
        new Complex(-.48905626, -1.40311925),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).sinh(),
        new Complex(.48905626, -1.40311925),
      );
      assertEquals(Complex.zero.sinh(), Complex.zero);
      assertEquals(Complex.NaN.sinh(), Complex.NaN);
      assertEquals(Complex.Infinity.sinh(), Complex.NaN);
    });

    await t.step("cosh()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).cosh(),
        new Complex(-.64214812, 1.06860742),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).cosh(),
        new Complex(-.64214812, -1.06860742),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).cosh(),
        new Complex(-.64214812, -1.06860742),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).cosh(),
        new Complex(-.64214812, 1.06860742),
      );
      assertEquals(Complex.zero.cosh(), Complex.one);
      assertEquals(Complex.NaN.cosh(), Complex.NaN);
      assertEquals(Complex.Infinity.cosh(), Complex.NaN);
    });

    await t.step("tanh()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).tanh(),
        new Complex(1.1667362572, -.2434582011),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).tanh(),
        new Complex(-1.1667362572, -.2434582011),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).tanh(),
        new Complex(1.1667362572, .2434582011),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).tanh(),
        new Complex(-1.1667362572, .2434582011),
      );
      assertEquals(Complex.zero.tanh(), Complex.zero);
      assertEquals(Complex.NaN.tanh(), Complex.NaN);
      assertEquals(Complex.Infinity.tanh(), Complex.NaN);
    });

    await t.step("coth()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).coth(),
        new Complex(.8213297974, .1713836129),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).coth(),
        new Complex(-.8213297974, .1713836129),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).coth(),
        new Complex(.8213297974, -.1713836129),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).coth(),
        new Complex(-.8213297974, -.1713836129),
      );
      assertEquals(Complex.zero.coth(), Complex.Infinity);
      assertEquals(Complex.NaN.coth(), Complex.NaN);
      assertEquals(Complex.Infinity.coth(), Complex.NaN);
    });

    await t.step("sech()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).sech(),
        new Complex(-.4131493442, -.6875274386),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).sech(),
        new Complex(-.4131493442, .6875274386),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).sech(),
        new Complex(-.4131493442, .6875274386),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).sech(),
        new Complex(-.4131493442, -.6875274386),
      );
      assertEquals(Complex.zero.sech(), Complex.one);
      assertEquals(Complex.NaN.sech(), Complex.NaN);
      assertEquals(Complex.Infinity.sech(), Complex.NaN);
    });

    await t.step("csch()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).csch(),
        new Complex(-.2215009308, -.6354937992),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).csch(),
        new Complex(.2215009308, -.6354937992),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).csch(),
        new Complex(-.2215009308, .6354937992),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).csch(),
        new Complex(.2215009308, .6354937992),
      );
      assertEquals(Complex.zero.csch(), Complex.Infinity);
      assertEquals(Complex.NaN.csch(), Complex.NaN);
      assertEquals(Complex.Infinity.csch(), Complex.NaN);
    });
  });

  await t.step("Inverse trigonometric functions", async (t) => {
    await t.step("asin()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).asin(),
        new Complex(.42707859, 1.52857092),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).asin(),
        new Complex(-.42707859, 1.52857092),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).asin(),
        new Complex(.42707859, -1.52857092),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).asin(),
        new Complex(-.42707859, -1.52857092),
      );
      assertEquals(Complex.zero.asin(), Complex.zero);
      assertEquals(Complex.NaN.asin(), Complex.NaN);
      assertEquals(Complex.Infinity.asin(), Complex.NaN);
    });

    await t.step("acos()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).acos(),
        new Complex(1.14371774, -1.52857092),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).acos(),
        new Complex(1.99787491, -1.52857092),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).acos(),
        new Complex(1.14371774, 1.52857092),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).acos(),
        new Complex(1.99787491, 1.52857092),
      );
      assertEquals(Complex.zero.acos(), new Complex(Math.PI / 2));
      assertEquals(Complex.NaN.acos(), Complex.NaN);
      assertEquals(Complex.Infinity.acos(), Complex.NaN);
    });

    await t.step("atan()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).atan(),
        new Complex(1.3389725222, .4023594781),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).atan(),
        new Complex(-1.33897252, .40235948),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).atan(),
        new Complex(1.33897252, -.40235948),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).atan(),
        new Complex(-1.33897252, -.40235948),
      );
      assertEquals(Complex.zero.atan(), Complex.zero);
      assertEquals(Complex.NaN.atan(), Complex.NaN);
      assertEquals(Complex.Infinity.atan(), Complex.NaN);
    });
  });

  await t.step("Inverse hyperbolic trigonometric functions", async (t) => {
    await t.step("asinh()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).asinh(),
        new Complex(1.46935174, 1.06344002),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).asinh(),
        new Complex(-1.46935174, 1.06344002),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).asinh(),
        new Complex(1.46935174, -1.06344002),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).asinh(),
        new Complex(-1.46935174, -1.06344002),
      );
      assertEquals(Complex.zero.asinh(), Complex.zero);
      assertEquals(Complex.NaN.asinh(), Complex.NaN);
      assertEquals(Complex.Infinity.asinh(), Complex.Infinity);
    });

    await t.step("acosh()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).acosh(),
        new Complex(1.5285709194, 1.14371774),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).acosh(),
        new Complex(1.5285709194, 1.9978749131),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).acosh(),
        new Complex(1.5285709194, -1.14371774),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).acosh(),
        new Complex(1.5285709194, -1.9978749131),
      );
      assertEquals(Complex.zero.acosh(), new Complex(0, Math.PI / 2));
      assertEquals(Complex.NaN.acosh(), Complex.NaN);
      assertEquals(Complex.Infinity.acosh(), Complex.NaN);
    });

    await t.step("atanh()", () => {
      assertAlmostEqualComplex(
        new Complex(1, 2).atanh(),
        new Complex(.1732867951, 1.1780972450),
      );
      assertAlmostEqualComplex(
        new Complex(-1, 2).atanh(),
        new Complex(-.1732867951, 1.1780972450),
      );
      assertAlmostEqualComplex(
        new Complex(1, -2).atanh(),
        new Complex(.1732867951, -1.1780972450),
      );
      assertAlmostEqualComplex(
        new Complex(-1, -2).atanh(),
        new Complex(-.1732867951, -1.1780972450),
      );
      assertEquals(Complex.zero.atanh(), Complex.zero);
      assertEquals(Complex.NaN.atanh(), Complex.NaN);
      assertEquals(Complex.Infinity.atanh(), Complex.NaN);
    });
  });
});
