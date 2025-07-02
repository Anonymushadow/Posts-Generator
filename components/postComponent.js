export const Post = ({ title, text, img, id, type, align }) => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("post__wrapper");

  const post = document.createElement("div");
  post.classList.add("post");
  post.dataset.id = id;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("post__delete");
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => wrapper.remove());

  const titleEl = document.createElement("div");
  titleEl.classList.add("post__title", "gradient__primary");
  titleEl.textContent = title;

  const textEl = document.createElement("div");
  textEl.classList.add("post__text", "gradient__secondary", `align__${align}`);
  textEl.textContent = text;

  const imgEl = document.createElement("img");
  imgEl.classList.add("post__img");
  if (img) imgEl.src = img;

  const logo = document.createElement("img");
  logo.classList.add("post__logo");
  logo.src = "./assets/DWC Logo.png";

  post.append(deleteBtn);

  if (["Lunes"].includes(type)) post.append(titleEl);
  if (["Martes - 1", "Jueves - 1"].includes(type)) post.append(imgEl);
  if (["Martes - 2", "Jueves - 2"].includes(type)) post.append(titleEl, textEl, logo);
  if (["Miercoles", "Viernes"].includes(type)) post.append(titleEl, logo);

  wrapper.appendChild(post);
  return wrapper;
};
