import React, {Component} from 'react';
import {track} from './../../src';

const ObjComponent = ({obj}) => (
    <div onClick={() => {
        obj.id++;
        obj.id++;
    }}>{obj.id}</div>
);

class ObjCLassComponent extends Component {
    render() {
        return (
            <div onClick={() => {
                this.props.obj.id++;
                this.props.obj.id++;
            }}>{this.props.obj.id}</div>
        );
    }
}

export default class TrackTest extends Component {

    @track count = 0;
    @track title = 'Hello';
    @track task = {
        id: 1
    };

    @track taskDeep = {
        id: 191,
        title: 'Some title',
        nested: {
            deepProp: 'val'
        }
    };

    @track uninit;

    @track withGetSet;

    @track array = [1, 2, 3];

    @track objForChildFunctionalComponent = {
        id: 200
    };

    @track objForChildClassComponent = {
        id: 200
    };

    componentDidMount() {
        window.trackTest = this;

        this.uninit = 10;

        let val = 3;
        this.withGetSet = {
            get val() {
                console.log('getter is working');
                return val;
            },
            set val(value) {
                console.log('setter is working');
                val = value;
            }
        };
    }

    increment() {
        this.count++;
        this.count++;
    }

    changeTask = () => {
        this.task = { id: 2 };
    };

    changeDeepTaskId = () => {
        this.taskDeep.id++;
    };

    changeDeepProp = () => {
        this.taskDeep.nested.deepProp += 1;
    };

    changeUninitProp = () => {
        this.uninit++;
    };

    changeWithGetSet = () => {
        this.withGetSet.val++;
    };

    render() {
        console.log('render');
        return (
            <div>
                <div>
                    {this.title} <button onClick={() => this.title = 'Hello there'}>Change title</button>
                </div>
                <div>
                    {this.count} <button onClick={() => this.increment()}>Increment</button>
                </div>
                <div>
                    Task id: {this.task.id} <button onClick={this.changeTask}>Change task id</button>
                </div>
                <div>
                    Deep task id: {this.taskDeep.id} title: {this.taskDeep.title} deepProp: {this.taskDeep.nested.deepProp}
                    <button onClick={this.changeDeepTaskId}>Change deep task id</button>
                    <button onClick={this.changeDeepProp}>Change deep prop</button>
                </div>
                <div>
                    Un-inited prop: {this.uninit}
                    <button onClick={this.changeUninitProp}>Change un-init</button>
                </div>
                <div>
                    With get/set: {this.withGetSet && this.withGetSet.val}
                    <button onClick={this.changeWithGetSet}>Change with get/set</button>
                </div>
                <div>
                    Child functional component:
                    <ObjComponent obj={this.objForChildFunctionalComponent} />
                </div>
                <div>
                    Child class component:
                    <ObjCLassComponent obj={this.objForChildClassComponent} />
                </div>
            </div>
        );
    }
}