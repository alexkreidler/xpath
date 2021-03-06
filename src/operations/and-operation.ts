import { XPathContext } from '../xpath-types';
import { BinaryOperation } from './binary-operation';

export class AndOperation extends BinaryOperation {
  evaluate(c: XPathContext) {
    const b = this.lhs.evaluate(c).bool;
    if (!b.booleanValue) {
      return b;
    }
    return this.rhs.evaluate(c).bool;
  }

  toString() {
    return '(' + this.lhs.toString() + ' and ' + this.rhs.toString() + ')';
  }
}
