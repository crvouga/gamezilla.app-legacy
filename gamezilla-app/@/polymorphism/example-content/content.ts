import {Polymorphic} from '../polymorphic-function';

export type Content = {
	Content: string;
};

export const renderHTML = Polymorphic<(content: Content) => string>();
