(() => {
	const SECRET_TIMESTAMP = Date.now();

	// Page Designer ready event
	subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale, viewport, breakout }) => {
		console.log('cloudinary.video_selector::sfcc:ready', dataLocale, displayLocale, isDisabled, isRequired, value, config, viewport);

		const template = obtainTemplate(viewport);
		const clone = document.importNode(template.content, true);
		document.body.appendChild(clone);
		function insertHandler(data) {
			var asset = (data && data.assets && data.assets.length > 0) ? Object.assign(data.assets[0], { cloudName: config.cloudName }) : null
			if (asset.resource_type !== config.type) {
				var root = document.getElementsByClassName('sfcc-ml-root')[0];
				var error = document.createElement('div');
				error.innerHTML = 'Wrong asset type';
				root.appendChild(error);
			} else {
				emit({
					type: 'sfcc:value',
					payload: asset
				});
				emit({
					type: 'sfcc:breakoutApply',
					payload: breakout
				})
			}
		}

		var show = {};
		if (value) {
			show.asset = {
				resource_type: value.resource_type,
				type: value.type,
				public_id: value.public_id
			}
		} else {
			show.folder = {
				resource_type: config.type,
				path: null
			}
		}


		var ml = cloudinary.createMediaLibrary({
			cloud_name: config.cloudName,
			api_key: config.apiKey,
			inline_container: 'div.sfcc-ml-root',
			max_files: 1,
			multiple: false,
		}, { insertHandler: insertHandler }
		);
		ml.show(
			show
		);

	});

	function obtainTemplate(viewport) {
		const template = document.createElement('template');
		const height = viewport.height - 16; // 16px = padding top + padding bottom
		template.innerHTML = `<div class="sfcc-ml-root" style="height: ${height}px; max-height: ${height}px;"></div>`;
		return template;
	}
})();
