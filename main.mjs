"use strict";
import { Post } from "./components/postComponent.js";
const inputAlignRadios = document.querySelectorAll('input[name="align"]');
const inputType = document.querySelector('.input__tool__type');
const downloadBtn = document.querySelector(".input__tool__download");


const postContainer = document.querySelector(".posts__container");

const data = {
    title: "Todos exigen pruebas... pero le rezan a un dios", 
    text: "Todos creen en un dios pero nunca lo questionan como una sugerencia de un amigo", 
    img: "", 
    id: 0, 
    type: "Lunes", 
    align: "center"
}

postContainer.append(Post(data));

const createBtn = document.querySelector(".input__tool__button");
const inputTitle = document.querySelector(".input__tool__title");
const inputText = document.querySelector(".input__tool__text");
const inputImg = document.querySelector(".input__tool__img");

let idCounter = 1;

createBtn.addEventListener("click", () => {
  const file = inputImg.files[0];
  let imgUrl = "";

  if (file) {
    imgUrl = URL.createObjectURL(file);
  }

  // obtener el valor del radio seleccionado
  const selectedAlign = [...inputAlignRadios].find(r => r.checked)?.value || "center";

  const newPostData = {
    title: inputTitle.value,
    text: inputText.value,
    img: imgUrl,
    id: idCounter++,
    type: inputType.value,
    align: selectedAlign
  };

  const newPost = Post(newPostData);
  postContainer.append(newPost);
});

downloadBtn.addEventListener("click", async () => {
  const posts = document.querySelectorAll(".post");
  const zip = new JSZip();
  let count = 1;

  for (const post of posts) {
    // Clonar el post para exportar sin modificar el original
    const clone = post.cloneNode(true);

    // ✅ Reemplazar elementos con texto degradado por SVG convertidos en <img>
    const gradientTextEls = clone.querySelectorAll(".gradient__primary, .gradient__secondary");

    for (const el of gradientTextEls) {
      const text = el.textContent.trim();
      const fontSize = parseInt(window.getComputedStyle(el).fontSize) || 60;
      const fontFamily = window.getComputedStyle(el).fontFamily;
      const isPrimary = el.classList.contains("gradient__primary");
      const gradientColors = isPrimary
        ? ["#1b0033", "#4e0789", "#1b0033"]
        : ["#7d7d7d", "#e8e8e8", "#7d7d7d"];

      // detectar alineación
      const textAlign = window.getComputedStyle(el).textAlign;
      const textAnchor = textAlign === "left" ? "start" : textAlign === "right" ? "end" : "middle";
      const xPos = textAlign === "left" ? 0 : textAlign === "right" ? 1080 : 540;

      const svgString = createGradientSVGText(
        text,
        1080,
        fontSize,
        `grad${count}`,
        gradientColors,
        fontFamily,
        textAnchor,
        xPos
      );

      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.src = url;
      img.style.width = "100%";

      await new Promise((resolve) => {
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
      });

      el.replaceWith(img);
    }

    // Envolver en un contenedor invisible
    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.top = "-10000px";
    wrapper.style.left = "0";
    wrapper.style.zIndex = "-1";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Captura con html2canvas
    const canvas = await html2canvas(clone, { backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    zip.file(`post-${count}.png`, base64, { base64: true });

    // Limpiar
    document.body.removeChild(wrapper);
    count++;
  }

  // Descargar ZIP
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "posts.zip");
});

function createGradientSVGText(
  text,
  width = 1080,
  fontSize = 60,
  gradientId = "grad1",
  gradientColors = ["#1b0033", "#4e0789", "#1b0033"],
  fontFamily = "'Cinzel Decorative', serif",
  textAnchor = "middle",
  xPos = 540
) {

  const stops = gradientColors.map((color, i) => {
    const offset = (i / (gradientColors.length - 1)) * 100;
    return `<stop offset="${offset}%" stop-color="${color}" />`;
  }).join("");

  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${fontSize + 30}">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
      ${stops}
    </linearGradient>
  </defs>
  <text x="${xPos}" y="${fontSize}" text-anchor="${textAnchor}" font-size="${fontSize}" fill="url(#${gradientId})" font-family="${fontFamily}" font-weight="bold">
    ${escapedText}
  </text>
</svg>`;
}
