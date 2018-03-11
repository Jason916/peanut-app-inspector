// jasonxu-2017/11/20
package wda

import (
	"errors"
	"encoding/json"
)

type GetEleTypeResp struct {
	Value  string `json:"value"`
	Status int    `json:"status"`
}

func (c *Client) GetEleType(elementId string) (*GetEleTypeResp, error) {
	if elementId == "" {
		return nil, errors.New("get elementID failed")
	}
	session, err := c.getSession()
	if err != nil {
		return nil, err
	}
	res, err := c.get("/session/" + session + "/element/" + elementId + "/attribute/type")
	if err != nil {
		return nil, err
	}
	var eleTypeResp GetEleTypeResp
	err = json.Unmarshal(res, &eleTypeResp)
	if err != nil {
		return nil, err
	}
	return &eleTypeResp, nil
}
