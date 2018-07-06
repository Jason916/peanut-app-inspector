// jasonxu-2017/11/19
package wda

import (
	"fmt"
	"encoding/json"
)

type ElementResp struct {
	Value struct {
		EleID string `json:"ELEMENT"`
		Type  string `json:"type"`
	} `json:"value"`
	Status int
}

type GetElementFailedResp struct {
	Value struct {
		ToUsing string `json:"using"`
		Value   string `json:"value"`
		Desc    string `json:"description"`
	} `json:"value"`
	Status int
}

type ElementRequest struct {
	ToUsing string `json:"using"`
	Value   string `json:"value"`
}

func (c *Client) GetElementInfo(using string, value string) (*ElementResp, error) {
	session, err := c.getSession()
	if err != nil {
		return nil, err
	}
	eleReq := ElementRequest{ToUsing: using, Value: value}
	reqBody, err := json.Marshal(eleReq)
	if err != nil {
		return nil, err
	}
	res, err := c.post("/session/"+session+"/element", reqBody)
	if err != nil {
		return nil, err
	}
	var eleResp *ElementResp
	err = json.Unmarshal(res, &eleResp)
	if err != nil {
		return nil, err
	}
	if eleResp.Status != StatusOK {
		var getElementFailedResp *GetElementFailedResp
		findErrorRespErr := json.Unmarshal(res, &getElementFailedResp)
		if findErrorRespErr == nil {
			return nil, fmt.Errorf("there is error when getting element info: %+v", getElementFailedResp)
		}
	}
	return eleResp, nil
}
