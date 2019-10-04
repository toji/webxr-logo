// Copyright 2019 Brandon Jones
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Some constants that define the logo's shape
const LOGO_WIDTH = 1;
const LOGO_HEIGHT = 0.8;
const LOGO_CORNER_RADIUS = 0.12;
const LOGO_BOTTOM_SCALE = 0.54;
const LOGO_BOTTOM_INDENT = 0.08;

// Populates a THREE.Shape with a single "fin" of the WebXR logo.
// (There are four fins in total.)
function CreateFinShape(ctx) {
  let hw = LOGO_WIDTH / 2;
  let hh = LOGO_HEIGHT / 2;

  let rhr = LOGO_CORNER_RADIUS / LOGO_HEIGHT;
  let rbwr = LOGO_CORNER_RADIUS / (LOGO_WIDTH * LOGO_BOTTOM_SCALE);

  function lerp(a, b, t) { return a + t * (b - a); }
  let hw_r = lerp(hw, hw * LOGO_BOTTOM_SCALE, rhr);
  let hw_br = lerp(hw * LOGO_BOTTOM_SCALE, hw, rhr);
  let hh_r = lerp(hh, hh - LOGO_BOTTOM_INDENT, rbwr);

  ctx.moveTo(hw_br, -hh + LOGO_CORNER_RADIUS);
  ctx.lineTo(hw_r, hh - LOGO_CORNER_RADIUS);
  ctx.quadraticCurveTo( hw, hh, hw - LOGO_CORNER_RADIUS, hh);
  ctx.lineTo(0, hh);
  ctx.lineTo(0, -hh + LOGO_BOTTOM_INDENT);
  ctx.lineTo((hw - LOGO_CORNER_RADIUS) * LOGO_BOTTOM_SCALE, -hh_r);
  ctx.quadraticCurveTo(hw * LOGO_BOTTOM_SCALE, -hh, hw_br, -hh + LOGO_CORNER_RADIUS);
  return ctx;
};

function CreateLogoShader(THREE, color1, color2) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      color1: {
        value: color1
      },
      color2: {
        value: color2
      }
    },
    vertexShader: `
      varying vec4 vPos;
      varying vec3 vNorm;

      void main() {
        vPos = vec4(position, 1.0);
        vNorm = normalMatrix * normal;
        gl_Position = projectionMatrix * modelViewMatrix * vPos;
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec4 vPos;
      varying vec3 vNorm;

      const vec3 backDir = vec3(-1, 0, 0);
      
      void main() {
        float colorMix = (vPos.y + (${LOGO_HEIGHT} * 0.5)) / ${LOGO_HEIGHT};
        float frontness = dot(vNorm, backDir) + 0.75;
        float alpha = clamp(frontness, 0.75, 1.0);
        gl_FragColor = vec4(mix(color1, color2, colorMix), alpha);
      }
    `,
  });
}

// A simple animated version of the WebXR logo that can function as a loading
// spinner or splash screen in both 2D and XR.
export default class WebXRLogoSpinner {
  constructor(THREE) {
    this.logoGroup = new THREE.Group();
    this.logoGroup.rotation.y = Math.PI/2;
    let finShape = CreateFinShape(new THREE.Shape());
    let finGeometry = new THREE.ShapeBufferGeometry( finShape );

    // Rear Right Fin
    let finMesh = new THREE.Mesh(finGeometry, CreateLogoShader(THREE, new THREE.Color(0xAE100F), new THREE.Color(0xD40002)));
    finMesh.rotation.set(0, Math.PI*0.25, 0);
    this.logoGroup.add(finMesh);

    // Rear Left Fin
    finMesh = new THREE.Mesh(finGeometry, CreateLogoShader(THREE, new THREE.Color(0xFD0003), new THREE.Color(0xD20002)));
    finMesh.rotation.set(0, Math.PI*0.75, 0);
    this.logoGroup.add(finMesh);

    // Front Left Fin
    finMesh = new THREE.Mesh(finGeometry, CreateLogoShader(THREE, new THREE.Color(0xAE100F), new THREE.Color(0xD40002)));
    finMesh.rotation.set(0, Math.PI*1.25, 0);
    this.logoGroup.add(finMesh);

    // Front Right Fin
    finMesh = new THREE.Mesh(finGeometry, CreateLogoShader(THREE, new THREE.Color(0xFD0003), new THREE.Color(0xD20002)));
    finMesh.rotation.set(0, Math.PI*1.75, 0);
    this.logoGroup.add(finMesh);
  }
}