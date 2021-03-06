import React from "react";
import expect from "expect";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { shallow } from "enzyme";
import renderer from "react-test-renderer";
import { Img } from "../src/app/components/Img";

Enzyme.configure({ adapter: new Adapter() });

describe("Component: Img", () => {
    it("renders without crashing", () => {
        const wrapper = shallow(<Img/>);
        expect(wrapper.length).toEqual(1);
    });

    it("renders correctly", () => {
        const wrapper = shallow(<Img/>);
        expect(wrapper).toMatchSnapshot();
    });

});

