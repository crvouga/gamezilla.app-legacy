import {IconButton} from '../icon-button';
import {IconXMark} from '../icon/icon-x-mark';

export const DrawerHeader = (input: {onClose?: () => void}) => {
	return (
		<div className="flex w-full items-center justify-end">
			<IconButton
				label="close drawer"
				onClick={
					input.onClose
				}
				renderIcon={(
					inputIcon,
				) => (
					<IconXMark
						{...inputIcon}
					/>
				)}
			/>
		</div>
	);
};
