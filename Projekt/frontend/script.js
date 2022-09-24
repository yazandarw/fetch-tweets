
const getAndDispalySerchResults = (searchQuery) => {
  fetch(`http://localhost:8080/search?q=${searchQuery}`)
    .then((response) => response.json())
    .then((result) => {
      const container = document.getElementById("tweets-container");
      const formatHshs = (array) => {
        let formatedHaseh = "";
        array.forEach((element) => {
          formatedHaseh += " #" + element;
        });
        return formatedHaseh;
      };
      container.innerHTML = "";

      document.getElementById("save-search").style.display = "block";
      result.forEach((element) => {
        if (!element.img) {
          const html = ` <div class="row justify-content-start post_card">
                    <div class="col-3">
                        <div>
                            <img class="pro-img" src="${element.profileimg}">
                        </div>
                    </div>
                    <div class="col-8 c">
                        <div class="row">
                            <h5>T${element.username}- </h5>
                            <p class="gray-small">${
                              element.date.split("+")[0]
                            }</p>
                        </div>
                        <div>
                            <p>${element.tweet}</p>
                            <p class="hashtag">${formatHshs(element.hashs)}</p>
                        </div>
                    </div>
                </div>`;
          let frag = document.createRange().createContextualFragment(html);
          container.appendChild(frag);
        } else {
          const html = ` <div class="row justify-content-start post_card">
                    <div class="col-3">
                        <div>
                            <img class="pro-img" src="${element.profileimg}">
                        </div>
                    </div>
                    <div class="col-8 c">
                        <div class="row">
                            <h5>T${element.username}- </h5>
                            <p class="gray-small">${
                              element.date.split("+")[0]
                            }</p>
                        </div>

                        <div>
                            <p>${element.tweet}</p>
                            <p class="hashtag">${formatHshs(element.hashs)}</p>
                            <img class="post_img" src="${element.img}">
                        </div>
                    </div>
                </div>`;
          let frag = document.createRange().createContextualFragment(html);
          container.appendChild(frag);
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

document.getElementById("search-button").addEventListener("click", () => {
  const searchQuery = document.getElementById("input").value;
  getAndDispalySerchResults(searchQuery);
});
let search = window.location.search;

if (search) {
  search = search.replace("?", "");
  const searchQuery = (document.getElementById("input").value = search.split(
    "="
  )[1]);
  document.getElementById("search-button").click();
}
document.getElementById("save-search").addEventListener("click", () => {
  const searchQuery = document.getElementById("input").value;
  const loginToken = localStorage.getItem("loginToken");

  if (!loginToken) {
    window.history.pushState("login", "Page", "login.html");
    window.location.reload();
  } else {
    fetch("http://localhost:8080/saveSearchQuery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        loginToken: loginToken,
      },
      body: JSON.stringify({
        search: searchQuery,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("save-search").innerText = "Searched Saved";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
