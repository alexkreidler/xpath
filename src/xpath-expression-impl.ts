import { FunctionResolverImpl } from './function-resolver';
import { isDocument } from './utils/types';
import { VariableResolverImpl } from './variable-resolver';
import { XPath } from './xpath';
import { XPathNSResolverWrapper } from './xpath-ns-resolver-wrapper';
import { XPathParser } from './xpath-parser';
import { XPathResultImpl } from './xpath-result-impl';
import { XPathContext } from './xpath-types';

export class XPathExpressionImpl implements XPathExpression {
  static getOwnerDocument(n: Node) {
    return isDocument(n) ? n : n.ownerDocument;
  }

  static detectHtmlDom(n?: Node) {
    if (!n) {
      return false;
    }

    const doc = XPathExpressionImpl.getOwnerDocument(n);

    try {
      if (doc != null) {
        return doc.implementation.hasFeature('HTML', '2.0');
      } else {
        return true;
      }
    } catch (e) {
      return true;
    }
  }

  xpath: XPath;
  context: XPathContext;

  constructor(e: string, r: XPathNSResolver | null, p: XPathParser) {
    this.xpath = p.parse(e);
    this.context = new XPathContext(
      new VariableResolverImpl(),
      new XPathNSResolverWrapper(r),
      new FunctionResolverImpl()
    );
  }

  evaluate(n: Node | undefined, t: number, _res: XPathResult | null) {
    // Intentionaly make the node as defined.
    // If no node is provided then the library will fail in case of context aware expression.
    n = n!;

    this.context.expressionContextNode = n;
    // backward compatibility - no reliable way to detect whether the DOM is HTML, but
    // this library has been using this method up until now, so we will continue to use it
    // ONLY when using an XPathExpression
    this.context.caseInsensitive = XPathExpressionImpl.detectHtmlDom(n);

    const result = this.xpath.evaluate(this.context);
    return new XPathResultImpl(result, t);
  }
}
