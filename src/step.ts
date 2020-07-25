import { NodeTest } from './node-test';
import { Expression } from './xpath-types';

// If we were to consolidate the names and the enum
// we would not support directly passing numbers
export enum AxisType {
  // 0
  Ancestor,
  AncestorOrSelf,
  Attribute,
  Child,
  Descendant,
  DescendantOrSelf,
  Following,
  FollowingSibling,
  Namespace,
  Parent,
  Preceding,
  PrecedingSibling,
  Self //12
}

// @ts-ignore
// StepTypes.prototype.toString = function () {
//   console.log('in toString');
//   console.log(this);

//   return Step.STEPNAMES[this];
// };

export class Step {
  static STEPNAMES = ([
    [AxisType.Ancestor, 'ancestor'],
    [AxisType.AncestorOrSelf, 'ancestor-or-self'],
    [AxisType.Attribute, 'attribute'],
    [AxisType.Child, 'child'],
    [AxisType.Descendant, 'descendant'],
    [AxisType.DescendantOrSelf, 'descendant-or-self'],
    [AxisType.Following, 'following'],
    [AxisType.FollowingSibling, 'following-sibling'],
    [AxisType.Namespace, 'namespace'],
    [AxisType.Parent, 'parent'],
    [AxisType.Preceding, 'preceding'],
    [AxisType.PrecedingSibling, 'preceding-sibling'],
    [AxisType.Self, 'self']
  ] as [AxisType, string][]).reduce((acc: any, x) => {
    return (acc[x[0]] = x[1]), acc;
  }, {} as { [key in AxisType]: string });

  static predicateString = (e: Expression) => `[${e.toString()}]`;
  static predicatesString = (es: Expression[]) => es.map(Step.predicateString).join('');

  axis: AxisType;
  nodeTest: NodeTest;
  predicates: Expression[];

  constructor(axis: AxisType, nodetest: NodeTest, preds: Expression[]) {
    this.axis = axis;
    this.nodeTest = nodetest;
    this.predicates = preds;
  }

  toString() {
    return Step.STEPNAMES[this.axis] + '::' + this.nodeTest.toString() + Step.predicatesString(this.predicates);
  }
}
