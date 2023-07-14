// 모달클래스
class Modal {
	constructor() {
		this.modal = null;
	}

	init(selector) {
		this.modal = new bootstrap.Modal(document.querySelector(selector));
	}

	open() {
		if (this.modal !== null) {
			this.modal.show();
		}
	}

	close() {
		if (this.modal !== null) {
			this.modal.hide();
		}
	}
}

const empUpdateModal = new Modal();
const postViewModal = new Modal();

// 상단 메뉴버튼 눌럿을 때
function pageMove(url) {
	$.ajax({
		url,
		dataType: "text"
	}).done((text) => {
		$("div#content").html(text);
	})
}

// 좌측 출퇴근 관리 버튼눌렀을 때
function inoutBtnHandler(event) {
	// ajax요청보내기
}

// order페이지 렌더링, sse
// 서버로부터 실시간으로 주문 알림을 받아 localstorage에 저장한다.(다른 페이지에 있더라도 주문이 들어오면 저장하기 위해)
// 메뉴탭의 주문관리버튼이 눌리면 ajax가 아닌 js로 화면을 렌더링한다.
function renderOrderContent() {
	// #content.innerHTML 다 삭제
	// localstorage에서 주문 정보를 얻어서 컴포넌트로 렌더링한다.
}

// order페이지 확인버튼 핸들러
function orderDelBtnHandler(event) {
	// 확인이 눌리면 DOM요소를 삭제하고 localstorage에서도 삭제한다.
	event.target.parentElement.parentElement.parentElement.remove();
}

// emp페이지 직원정보 수정모달
function empUpdateBtnHandler(event) {
	// ajax를 통해 받아와야하는 직원정보가 적힌 모달
	const updateModalHTML = `
		<div class="modal-header">
			<h5 class="modal-title" id="staticBackdropLabel">직원수정</h5>
			<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		</div>
		<div class="modal-body" id="modal-body">
			<label class="form-label">이름</label>
			<input type="text" class="form-control" value="직원2">
			<label class="form-label">시급</label>
			<input type="text" class="form-control" value="9400">
			<label class="form-label">전화번호</label>
			<input type="text" class="form-control" value="010-2222-2222">
		</div>
		<div class="modal-footer">
			<button type="button" class="btn btn-primary">수정하기</button>
			<button type="button" class="btn btn-danger" data-bs-dismiss="modal">취소</button>
		</div>
	`;
	document.querySelector("div#update-modal-content").innerHTML = updateModalHTML;
	empUpdateModal.open();
}

// stock 페이지
// 수정버튼 눌렀을때
function stockUpdateBtnHandler(event) {
	const tr = event.target.parentElement.parentElement;
	const quantityTd = tr.querySelector("td:nth-child(2)");
	const buttonTd = tr.querySelector("td:nth-child(3)");
	const isUpdating = tr.classList.contains("updating");

	// 이미 수정중일때
	if (isUpdating) {
		const cnt = quantityTd.querySelector("input").value;
		const foodNum = tr.getAttribute("food-num");
		$.ajax({
			url: "/admin/stockupdate.do",
			data: {
				foodno: foodNum,
				quantity: cnt,
			},
			dataType: "text"
		}).done((text) => {
			$("#content").html(text);
		})

	}
	else {
		const cnt = quantityTd.textContent;
		tr.setAttribute("prev", cnt);
		quantityTd.innerHTML = `
			<button class="btn btn-dark minusBtn" onclick="stockMinusBtnHandler(event)">
			</button><input type="text" value="${cnt}" class="form-control quantity">
			<button class="btn btn-dark plusBtn" onclick="stockPlusBtnHandler(event)"></button>
		`
		buttonTd.innerHTML += `<button class="btn btn-danger cancelBtn" onclick="stockUpdateCancelBtnHandler(event)">취소</button>`
	}
	tr.classList.toggle("updating");
}

// 수정중에 취소버튼 눌렀을 때
function stockUpdateCancelBtnHandler(event) {
	const cancelBtn = event.target;
	const tr = cancelBtn.parentElement.parentElement;
	const quantityTd = tr.querySelector("td:nth-child(2)");
	const buttonTd = tr.querySelector("td:nth-child(3)");

	quantityTd.innerHTML = tr.getAttribute("prev");
	tr.removeAttribute("prev");
	buttonTd.lastChild.remove();
	tr.classList.toggle("updating")
}

// 수량변경 버튼 눌럿을 때
function stockMinusBtnHandler(event) {
	const inputEl = event.target.parentElement.querySelector("input");
	const val = Number(inputEl.value) - 1
	inputEl.value = Math.max(val, 0);
}

function stockPlusBtnHandler(event) {
	const inputEl = event.target.parentElement.querySelector("input");
	inputEl.value = Number(inputEl.value) + 1;
}

// 주문하기 버튼 눌렀을 때
function stockOrderBtnHandler() {
	// ajax요청보내기
	// url: /admin/stockorder.do
	// foodno, quantity
	$.ajax({
		url: "/admin/stockorder.do",
		data: getStockOrderData(),
		dataType: "text",
		contentType: "application/x-www-form-urlencoded",
		method: "post"
	}).done((text) => {
		alert("발주주문 완료");
		document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
		$("#content").html(text);
	})
}

function getStockOrderData() {
	let words = [];
	const trs = document.querySelectorAll("tr.stockOrder");
	for (const tr of trs) {
		const foodNo = tr.querySelector("select.form-select").value;
		const quantity = tr.querySelector("input.stock-cnt").value;
		words.push(`foodno=${foodNo}`);
		words.push(`quantity=${quantity}`);
	}
	console.log(words.join("&"));
	return words.join("&");
}

// 발주주문 항목 삭제버튼 눌럿을 때
function delStockOrderBtnHandler(event) {
	event.target.parentElement.parentElement.remove();
}

// 발주주문 항목추가 눌럿을 때
function addStockOrderBtnHandler() {
	document.querySelector("table[page='stock-modal'] > tbody").appendChild(stockOrderElement());
}

function stockOrderElement() {
	const tr = document.createElement("tr");
	tr.classList.add("stockOrder");
	tr.innerHTML = `
	<td>
		<select class="form-select" aria-label="재료선택">
			<option value = "0" selected>재료선택</option>
			<option value="1">빵</option>
			<option value="2">소고기패티</option>
			<option value="3">닭고기패티</option>
			<option value="4">새우패티</option>
			<option value="5">닭고기</option>
			<option value="6">소스</option>
			<option value="7">치즈</option>
			<option value="8">양상추</option>
			<option value="9">양파</option>
			<option value="10">해쉬브라운</option>
			<option value="11">감자튀김</option>
			<option value="12">초코시럽</option>
			<option value="13">딸기시럽</option>
			<option value="14">바닐라시럽</option>
			<option value="15">오레오</option>
			<option value="16">아이스크림</option>
			<option value="17">원두</option>
			<option value="18">라떼시럽</option>
			<option value="19">코카콜라</option>
			<option value="20">코카콜라 제로</option>
			<option value="21">스프라이트</option>
			<option value="22">환타</option>
			<option value="23">쉐이크</option>
			<option value="24">오렌지 주스</option>
			<option value="25">생수</option>
			<option value="26">코울슬로</option>
			<option value="27">과자콘</option>
		</select>
	</td>
	<td>
		<input class="form-control stock-cnt" type="number" placeholder="수량입력"/>
		<button class="btn btn-sm btn-danger stockDelBtn" onClick="delStockOrderBtnHandler(event)">X</button>
	</td>
`
	return tr;
}

// post페이지
// 문의내역 조회 모달 (문의글 클릭했을 때)
function openViewModal(num) {
	// num -> Post테이블의 no
	// ajax로 num보내고 모달 내용 응답받기
	const modalHTML = `
	<div class="modal-header">
		<h3 class="modal-title" id="staticBackdropLabel">문의 내역 조회</h3>
		<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	</div>
	<div class="modal-body">
		<h3>문의 내용</h3>
		<h5>제목</h5>
		<p>문의글 제목${num}</p>
		<h5>내용</h5>
		<p class="post-content">알림 기능은 공지사항, 이벤트, 업데이트와 같은 제품 및 서비스 소식을 알리는 기능을 말합니다.
			일반적으로 리스트형 게시판을 이용하며 긴급한 내용은 팝업으로 띄우기도 합니다.
			알림 기능은 새로운 소식을 알리는 것 외에 또 하나의 중요한 역할이 있습니다.
			서비스에 문제가 생겼을 때 공개적으로 선제 대응과 후속 조치를 할 수 있다는 점입니다.
			그러면 실제로 문제가 닥쳐도 고객이 느끼는 부정적인 인식이 한결 줄어들며 신뢰도를 높일 수 있습니다.
			영문 모르는 고객들의 문의가 반복적으로 쇄도하는 것도 막을 수 있고요.
			그리고 정기적인 공지나 업데이트는 서비스가 활성화되어 있다는 것을 알려줄 수도 있습니다.

			공지사항을 최상단에 둔 모바일 게임 ‘앨리스클로젯’, ‘가디언테일즈’(카카오게임즈) 고객센터 (카카오게임즈도 오큐파이로 고객센터를 만들고 운영 중입니다)
		</p>
		<hr>
		<h3>답변</h3>
		<h5>제목</h5>
		<p>답변 제목${num}</p>
		<h5>내용</h5>
		<p class="post-content">알림 기능은 공지사항, 이벤트, 업데이트와 같은 제품 및 서비스 소식을 알리는 기능을 말합니다.
			일반적으로 리스트형 게시판을 이용하며 긴급한 내용은 팝업으로 띄우기도 합니다.
			알림 기능은 새로운 소식을 알리는 것 외에 또 하나의 중요한 역할이 있습니다.
			서비스에 문제가 생겼을 때 공개적으로 선제 대응과 후속 조치를 할 수 있다는 점입니다.
			그러면 실제로 문제가 닥쳐도 고객이 느끼는 부정적인 인식이 한결 줄어들며 신뢰도를 높일 수 있습니다.
			영문 모르는 고객들의 문의가 반복적으로 쇄도하는 것도 막을 수 있고요.
			그리고 정기적인 공지나 업데이트는 서비스가 활성화되어 있다는 것을 알려줄 수도 있습니다.

			공지사항을 최상단에 둔 모바일 게임 ‘앨리스클로젯’, ‘가디언테일즈’(카카오게임즈) 고객센터 (카카오게임즈도 오큐파이로 고객센터를 만들고 운영 중입니다)
		</p>
	</div>
	<div class="modal-footer">
		<button type="button" class="btn btn-primary" data-bs-dismiss="modal">확인</button>
	</div>
	`
	document.querySelector("div#post-view-modal-content").innerHTML = modalHTML;
	postViewModal.open();
}

// 문의글 작성 모달에서 작성버튼 눌렀을 때
function writePostBtnHandler() {
	// 작성 내용긁어서 등록 요청보내기
	alert("작성요청 보내기")
}
