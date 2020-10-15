import Element from '../nodes/basic/element/Element';
import Node from '../nodes/basic/node/Node';
import SelfClosingHTMLElements from '../html-config/SelfClosingHTMLElements';
import UnclosedHTMLElements from '../html-config/UnclosedHTMLElements';
import DocumentType from '../nodes/basic/document-type/DocumentType';
import { encode } from 'he';

/**
 * Utility for converting an element to string.
 *
 * @class QuerySelector
 */
export default class XMLSerializer {
	/**
	 * Renders an element as HTML.
	 *
	 * @param element Element to render.
	 * @return Result.
	 */
	public serializeToString(root: Node): string {
		switch (root.nodeType) {
			case Node.ELEMENT_NODE:
				const element = <Element>root;
				const tagName = element.tagName.toLowerCase();

				if (UnclosedHTMLElements.includes(tagName)) {
					return `<${tagName}${this._getAttributes(element)}>`;
				} else if (SelfClosingHTMLElements.includes(tagName)) {
					return `<${tagName}${this._getAttributes(element)}/>`;
				}

				let innerHTML = '';
				for (const node of root.childNodes) {
					innerHTML += this.serializeToString(node);
				}

				return `<${tagName}${this._getAttributes(element)}>${innerHTML}</${tagName}>`;
			case Node.DOCUMENT_FRAGMENT_NODE:
			case Node.DOCUMENT_NODE:
				let html = '';
				for (const node of root.childNodes) {
					html += this.serializeToString(node);
				}
				return html;
			case Node.COMMENT_NODE:
				return `<!--${root.textContent}-->`;
			case Node.TEXT_NODE:
				return root['textContent'];
			case Node.DOCUMENT_TYPE_NODE:
				const doctype = <DocumentType>root;
				const identifier = doctype.publicId ? ' PUBLIC' : doctype.systemId ? ' SYSTEM' : '';
				const publicId = doctype.publicId ? ` "${doctype.publicId}"` : '';
				const systemId = doctype.systemId ? ` "${doctype.systemId}"` : '';
				return `<!DOCTYPE ${doctype.name}${identifier}${publicId}${systemId}>`;
		}

		return '';
	}

	/**
	 * Returns attributes as a string.
	 *
	 * @param element Element.
	 * @return Attributes.
	 */
	private _getAttributes(element: Element): string {
		const attributes = [];
		for (const attribute of Object.values(element._attributes)) {
			if (attribute.value !== null) {
				attributes.push(attribute.name + '="' + encode(attribute.value) + '"');
			}
		}
		return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
	}
}
