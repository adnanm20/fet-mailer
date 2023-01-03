
	function handleCredentialResponse(response) {
		console.log(response.credential);
		form = document.createElement("form");
		form.setAttribute("action", "/login");
		form.setAttribute("method", "post");

		input = document.createElement("input")
		input.setAttribute("type", "text");
		input.setAttribute("name", "id");

		form.appendChild(input);

		input.value = response.credential;

		document.body.appendChild(form);
		form.style.visibility = "hidden";
		form.submit();
	}

	document.getElementById("form").addEventListener("submit", e => { e.preventDefault(); })

	document.getElementById("form").addEventListener("input", () => {
		markPosts();
	});

	function markPosts() {
		document.querySelectorAll(".post").forEach(el => {el.classList.remove("marked")});
		document.querySelectorAll('input[value="1"][type="radio"]:checked').forEach(el => {
			document.querySelectorAll(".post").forEach(post => {
				let i = posts.findIndex(ps => ps.link == post.id);
				if(i < 0) return;
				if(posts[i].labels.includes(labels[el.name.slice(3)]))
				{
					post.classList.add("marked");
				}
				if(posts[i].labels.length == 0 && labels[el.name.slice(3)] == "bez oznake")
				{
					post.classList.add("marked");
				}
			});			
		});

		document.querySelectorAll('input[value="0"][type="radio"]:checked').forEach(el => {
			document.querySelectorAll(".post").forEach(post => {
				let i = posts.findIndex(ps => ps.link == post.id);
				if(i < 0) return;
				if(posts[i].labels.includes(labels[el.name.slice(3)]))
				{
					post.classList.remove("marked");
				}
				if(posts[i].labels.length == 0 && labels[el.name.slice(3)] == "bez oznake")
				{
					post.classList.remove("marked");
				}
			});			
		});
	}

	function toggleHelp() {
		document.getElementById("help").classList.toggle("ex-inv");
	}

	var labels = [];
	var choices = [];
	var posts = [];

	window.onload = () => {

		google.accounts.id.initialize({
			client_id: "52768886806-ui82pjvb26rs1kbp97u2huhsbhpav7ra.apps.googleusercontent.com",
			callback: handleCredentialResponse
		});
		google.accounts.id.renderButton(
			document.getElementById("buttonDiv"),
			{ theme: "filled-blue", size: "large" }  // customization attributes
		);
		google.accounts.id.prompt(); // also display the One Tap dialog
		console.log("HI");

		requestChoices();
		requestPosts();
	};

	function requestChoices() {
		var req = new XMLHttpRequest();
		req.open("POST", "/choices", true);
		req.send();
		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				choices = JSON.parse(req.response);
				populateChoices();
			}
		}
	}

	function populateChoices() {
		grid = document.getElementById("grid");

		choices.forEach(choice => {
			labels[choice.id] = choice.name;
			div = document.createElement("div");
			div.classList.add("label");
			div.textContent = choice.name;

			input1 = document.createElement("input");
			input1.setAttribute("type", "radio");
			input1.setAttribute("value", 1);
			input1.setAttribute("name", "ch-" + choice.id.toString());

			input2 = document.createElement("input");
			input2.setAttribute("type", "radio")
			input2.setAttribute("value", 0);
			input2.setAttribute("name", "ch-" + choice.id.toString());

			input3 = document.createElement("input");
			input3.setAttribute("type", "radio")
			input3.setAttribute("value", 2);
			input3.setAttribute("name", "ch-" + choice.id.toString());

			if(choice.state == 2)
			{
				input3.setAttribute("checked", "on");
			}
			else if(choice.state == 1)
			{
				input1.setAttribute("checked", "on");
			}
			else if(choice.state == 0)
			{
				input2.setAttribute("checked", "on");
			}

			grid.appendChild(div);
			grid.appendChild(input1);
			grid.appendChild(input2);
			grid.appendChild(input3);
		});
	}

	function requestPosts() {
		var req = new XMLHttpRequest();
		req.open("POST", "/posts", true);
		req.send();
		req.onreadystatechange = () => {
			if (req.readyState === 4) {
				posts = JSON.parse(req.response);
				populatePosts();
			}
		}
	}

	function populatePosts() {
		let cont = document.getElementById("post-container")
		for(i = 0; i < (10 < posts.length ? 10 : post.length); i++)
		{
			let post = posts[i];
			let divPost = document.createElement('div');
			divPost.classList.add('post');
			divPost.setAttribute("id", post.link);
			let divMob = document.createElement('div');
			divMob.classList.add('mobilecont');
			let divUser = document.createElement('div');
			divUser.classList.add('post-username');
			divUser.textContent = post.user;
			let divHead = document.createElement('div');
			divHead.classList.add('post-headline');
			divHead.textContent = post.headline;
			let divLabels = document.createElement('div');
			divLabels.classList.add('post-labels');
			
			post.labels.forEach(label => {
				let divLabel = document.createElement('div');
				
				divLabel.classList.add('post-label');
				divLabel.textContent = label;

				divLabels.appendChild(divLabel);
			});


			divMob.appendChild(divUser);
			divMob.appendChild(divLabels);
			divPost.appendChild(divMob);
			divPost.appendChild(divHead);
			cont.appendChild(divPost);
		}
		markPosts();
	}