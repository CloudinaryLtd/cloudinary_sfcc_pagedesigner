(() => {
	let resourceType;
	subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
		console.log('cloudinary.video_selector_trigger::sfcc:ready', dataLocale, displayLocale, isDisabled, isRequired, value, config);
		resourceType = config.mlType;
		const template = obtainTemplate(value, resourceType);
		const clone = document.importNode(template.content, true);
		document.body.appendChild(clone);

		// Apply event listeners
		const buttonEl = document.querySelector('.slds-file-selector__button');
		const imgEl = document.querySelector(`.${resourceType}_selector__image img`);
		buttonEl && buttonEl.addEventListener('click', triggerBreakout);
		imgEl && imgEl.addEventListener('click', triggerBreakout);
	});

	function obtainTemplate(selectedResource, resourceType) {
		const template = document.createElement('template');
		const markup = selectedResource ? obtainItemMarkup(selectedResource) : obtainDefaultMarkup(resourceType);
		template.innerHTML = `<div class="${resourceType}_selector__container">${markup}</div>`;
		return template;
	}

	function imageTransform(option) {
		const { version, format } = option;
		secure_url = getAssetImageUrl(option);
		const arr = secure_url.split('v' + version); // Remove version number
		arr.splice(1, 0, 'c_lpad,h_150,w_150'); // Inject settings
		return arr.join('').replace('.' + format, '.jpg');
	}

	function getAssetImageUrl(asset) {
		if (asset.derived && asset.derived.length > 0) {
			return asset.derived[0].secure_url;
		}
		return asset.secure_url;
	}

	function obtainDefaultMarkup(assetType) {
		return formsEls.getMlTrigger(assetType);
	}

	function obtainItemMarkup(option) {
		const url = imageTransform(option);
		return `<div class="${resourceType}_selector__item" data-value="${option.public_id}">
  			<div class="${resourceType}_selector__image">
    <a href="javascript:void(0);"><img src="${url}" /></a>
  </div>
  <div class="video_selector__data">
    <span class="video_selector__data__id">${option.public_id}</span><br />
    <span class="video_selector__data__type">${option.resource_type}</span> - 
    <span class="video_selector__data__format">${option.format}</span> - 
    <span class="video_selector__data__size">${option.width} x ${option.height}</span>
  </div>
  <div class="video_selector__action">
    <button type="button" class="slds-button slds-button_neutral">Select</button>
  </div>`
	}

	function updateMarkup(value) {
		//const selectedResourceId = obtainDisplayValue(value);
		// const selectedResource = selectedResourceId ? videoResources.find(option => selectedResourceId === option.public_id) : null;

		// Remove event listeners
		let buttonEl = document.querySelector('button');
		let imgEl = document.querySelector(`.${resourceType}_selector__image img`);
		buttonEl && buttonEl.removeEventListener('click', triggerBreakout);
		imgEl && imgEl.removeEventListener('click', triggerBreakout);

		// Inject updated markup
		document.querySelector(`.${resourceType}_selector__container`).innerHTML = value ? obtainItemMarkup(value) : obtainDefaultMarkup();

		// Apply event listeners
		buttonEl = document.querySelector('button');
		imgEl = document.querySelector(`.${resourceType}_selector__image img`);
		buttonEl && buttonEl.addEventListener('click', triggerBreakout);
		imgEl && imgEl.addEventListener('click', triggerBreakout);
	}

	function obtainDisplayValue(value) {
		return typeof value === 'object' && value !== null && typeof value.public_id === 'string' ? value.public_id : null;
	}

	function triggerBreakout() {
		emit({
			type: 'sfcc:breakout',
			payload: {
				id: 'breakout',
				title: `Cloudinary ${resourceType}`
			}
		}, handleBreakoutClose);
	}

	function handleBreakoutClose({ type, value }) {
		if (type === 'sfcc:breakoutApply') {
			handleBreakoutApply(value);
		} else {
			handleBreakoutCancel();
		}
	}

	function handleBreakoutCancel() {
		// Grab focus
		const buttonEl = document.querySelector('button');
		buttonEl && buttonEl.focus();
	}

	function handleBreakoutApply(value) {
		// Update input value
		updateMarkup(value);

		// Emit value update
		emit({
			type: 'sfcc:value',
			payload: value
		});

		// Grab focus
		const buttonEl = document.querySelector('button');
		buttonEl && buttonEl.focus();
	}
})();