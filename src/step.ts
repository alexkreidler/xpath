import { NodeTest } from './node-test';
import { Expression } from './xpath-types';

// If we were to consolidate the names and the enum
// we would not support directly passing numbers
export enum StepTypes {
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
    [StepTypes.Ancestor, 'ancestor'],
    [StepTypes.AncestorOrSelf, 'ancestor-or-self'],
    [StepTypes.Attribute, 'attribute'],
    [StepTypes.Child, 'child'],
    [StepTypes.Descendant, 'descendant'],
    [StepTypes.DescendantOrSelf, 'descendant-or-self'],
    [StepTypes.Following, 'following'],
    [StepTypes.FollowingSibling, 'following-sibling'],
    [StepTypes.Namespace, 'namespace'],
    [StepTypes.Parent, 'parent'],
    [StepTypes.Preceding, 'preceding'],
    [StepTypes.PrecedingSibling, 'preceding-sibling'],
    [StepTypes.Self, 'self']
  ] as [StepTypes, string][]).reduce((acc: any, x) => {
    return (acc[x[0]] = x[1]), acc;
  }, {} as { [key in StepTypes]: string });

  static predicateString = (e: Expression) => `[${e.toString()}]`;
  static predicatesString = (es: Expression[]) => es.map(Step.predicateString).join('');

  axis: StepTypes;
  nodeTest: NodeTest;
  predicates: Expression[];

  constructor(axis: StepTypes, nodetest: NodeTest, preds: Expression[]) {
    this.axis = axis;
    this.nodeTest = nodetest;
    this.predicates = preds;
  }

  toString() {
    return Step.STEPNAMES[this.axis] + '::' + this.nodeTest.toString() + Step.predicatesString(this.predicates);
  }
}
