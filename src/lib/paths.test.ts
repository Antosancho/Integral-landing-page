import { describe, expect, it } from 'vitest';
import { withBase } from './paths';

describe('withBase', () => {
  it.each([
    ['/favicon.png', '/', '/favicon.png'],
    ['/favicon.png', '', '/favicon.png'],
    ['/favicon.png', '/Integral-landing-page', '/Integral-landing-page/favicon.png'],
    ['/favicon.png', '/Integral-landing-page/', '/Integral-landing-page/favicon.png'],
    ['favicon.png', '/Integral-landing-page/', '/Integral-landing-page/favicon.png'],
    [
      '/brand/factor-integral-horizontal-oscuro.png',
      '/Integral-landing-page',
      '/Integral-landing-page/brand/factor-integral-horizontal-oscuro.png',
    ],
    ['/', '/', '/'],
    ['/', '/Integral-landing-page', '/Integral-landing-page/'],
    ['', '/Integral-landing-page', '/Integral-landing-page/'],
    ['#contacto', '/Integral-landing-page', '#contacto'],
    ['https://factorintegral.ar/x.png', '/Integral-landing-page', 'https://factorintegral.ar/x.png'],
    ['/favicon.png', 'Integral-landing-page', '/Integral-landing-page/favicon.png'],
  ])('withBase(%j, %j) = %j', (path, base, expected) => {
    expect(withBase(path, base)).toBe(expected);
  });
});
